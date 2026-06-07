
-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'coordinator', 'helper');
CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.request_type AS ENUM ('help', 'pain', 'water', 'food', 'bathroom', 'company', 'other');

-- =========================================
-- updated_at trigger function
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role public.app_role NOT NULL DEFAULT 'helper',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'helper')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profile policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- =========================================
-- CARE CIRCLES
-- =========================================
CREATE TABLE public.care_circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  patient_name TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_circles TO authenticated;
GRANT ALL ON public.care_circles TO service_role;
ALTER TABLE public.care_circles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_care_circles_updated_at BEFORE UPDATE ON public.care_circles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- CIRCLE MEMBERS
-- =========================================
CREATE TABLE public.circle_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'helper',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.circle_members TO authenticated;
GRANT ALL ON public.circle_members TO service_role;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_circle_members_user ON public.circle_members(user_id);
CREATE INDEX idx_circle_members_circle ON public.circle_members(circle_id);

-- =========================================
-- Helper security definer functions (avoid RLS recursion)
-- =========================================
CREATE OR REPLACE FUNCTION public.is_circle_member(_circle_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.circle_role(_circle_id UUID, _user_id UUID)
RETURNS public.app_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.circle_members
  WHERE circle_id = _circle_id AND user_id = _user_id LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_circle_role(_circle_id UUID, _user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- Care circles policies
CREATE POLICY "Members can view their circles"
  ON public.care_circles FOR SELECT TO authenticated
  USING (public.is_circle_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Authenticated users can create circles"
  ON public.care_circles FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update circles"
  ON public.care_circles FOR UPDATE TO authenticated
  USING (public.has_circle_role(id, auth.uid(), ARRAY['admin']::public.app_role[]));
CREATE POLICY "Admins can delete circles"
  ON public.care_circles FOR DELETE TO authenticated
  USING (public.has_circle_role(id, auth.uid(), ARRAY['admin']::public.app_role[]));

-- Circle members policies
CREATE POLICY "Members can view circle membership"
  ON public.circle_members FOR SELECT TO authenticated
  USING (public.is_circle_member(circle_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Admins can add members"
  ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (
    public.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[])
    OR EXISTS (SELECT 1 FROM public.care_circles WHERE id = circle_id AND created_by = auth.uid())
  );
CREATE POLICY "Admins can update members"
  ON public.circle_members FOR UPDATE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));
CREATE POLICY "Admins can remove members"
  ON public.circle_members FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]) OR user_id = auth.uid());

-- =========================================
-- TASKS
-- =========================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  assignee_id UUID REFERENCES auth.users(id),
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'todo',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_tasks_circle ON public.tasks(circle_id);

CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Members can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

-- =========================================
-- MEDICATIONS
-- =========================================
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  instructions TEXT,
  refill_at DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medications TO authenticated;
GRANT ALL ON public.medications TO service_role;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_medications_circle ON public.medications(circle_id);

CREATE POLICY "Members can view medications"
  ON public.medications FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create medications"
  ON public.medications FOR INSERT TO authenticated
  WITH CHECK (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can update medications"
  ON public.medications FOR UPDATE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can delete medications"
  ON public.medications FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

-- =========================================
-- MEDICATION LOGS
-- =========================================
CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  logged_by UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medication_logs TO authenticated;
GRANT ALL ON public.medication_logs TO service_role;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_medlogs_med ON public.medication_logs(medication_id);
CREATE INDEX idx_medlogs_circle ON public.medication_logs(circle_id);

CREATE POLICY "Members can view medication logs"
  ON public.medication_logs FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can log medication doses"
  ON public.medication_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_member(circle_id, auth.uid()) AND logged_by = auth.uid());
CREATE POLICY "Loggers can update own logs"
  ON public.medication_logs FOR UPDATE TO authenticated USING (logged_by = auth.uid());
CREATE POLICY "Admins/coordinators can delete logs"
  ON public.medication_logs FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]) OR logged_by = auth.uid());

-- =========================================
-- APPOINTMENTS
-- =========================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  location TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_appointments_circle ON public.appointments(circle_id);

CREATE POLICY "Members can view appointments"
  ON public.appointments FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

-- =========================================
-- PATIENT REQUESTS
-- =========================================
CREATE TABLE public.patient_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  type public.request_type NOT NULL DEFAULT 'help',
  message TEXT,
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_requests TO authenticated;
GRANT ALL ON public.patient_requests TO service_role;
ALTER TABLE public.patient_requests ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_patient_requests_updated_at BEFORE UPDATE ON public.patient_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_requests_circle ON public.patient_requests(circle_id);

CREATE POLICY "Members can view requests"
  ON public.patient_requests FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can create requests"
  ON public.patient_requests FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_member(circle_id, auth.uid()) AND patient_id = auth.uid());
CREATE POLICY "Members can update requests"
  ON public.patient_requests FOR UPDATE TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can delete requests"
  ON public.patient_requests FOR DELETE TO authenticated
  USING (public.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

-- =========================================
-- PATIENT MOODS
-- =========================================
CREATE TABLE public.patient_moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id),
  mood INT NOT NULL CHECK (mood BETWEEN 1 AND 5),
  pain_level INT CHECK (pain_level BETWEEN 0 AND 10),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_moods TO authenticated;
GRANT ALL ON public.patient_moods TO service_role;
ALTER TABLE public.patient_moods ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_moods_circle ON public.patient_moods(circle_id);

CREATE POLICY "Members can view moods"
  ON public.patient_moods FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can log own moods"
  ON public.patient_moods FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_member(circle_id, auth.uid()) AND patient_id = auth.uid());
CREATE POLICY "Patient can update own moods"
  ON public.patient_moods FOR UPDATE TO authenticated USING (patient_id = auth.uid());
CREATE POLICY "Patient or admin can delete moods"
  ON public.patient_moods FOR DELETE TO authenticated
  USING (patient_id = auth.uid() OR public.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));

-- =========================================
-- FEED POSTS
-- =========================================
CREATE TABLE public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID NOT NULL REFERENCES public.care_circles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feed_posts TO authenticated;
GRANT ALL ON public.feed_posts TO service_role;
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_feed_circle ON public.feed_posts(circle_id);

CREATE POLICY "Members can view feed"
  ON public.feed_posts FOR SELECT TO authenticated USING (public.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can post to feed"
  ON public.feed_posts FOR INSERT TO authenticated
  WITH CHECK (public.is_circle_member(circle_id, auth.uid()) AND author_id = auth.uid());
CREATE POLICY "Authors can update own posts"
  ON public.feed_posts FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Authors or admins can delete posts"
  ON public.feed_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));

-- =========================================
-- NOTIFICATIONS
-- =========================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user ON public.notifications(user_id);

CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users insert own notifications"
  ON public.notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- =========================================
-- REALTIME
-- =========================================
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.medications REPLICA IDENTITY FULL;
ALTER TABLE public.medication_logs REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.patient_requests REPLICA IDENTITY FULL;
ALTER TABLE public.patient_moods REPLICA IDENTITY FULL;
ALTER TABLE public.feed_posts REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patient_moods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
