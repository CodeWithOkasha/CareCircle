CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE OR REPLACE FUNCTION app_private.is_circle_member(_circle_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION app_private.circle_role(_circle_id UUID, _user_id UUID)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.circle_members
  WHERE circle_id = _circle_id AND user_id = _user_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION app_private.has_circle_role(_circle_id UUID, _user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.circle_members
    WHERE circle_id = _circle_id AND user_id = _user_id AND role = ANY(_roles)
  );
$$;

GRANT EXECUTE ON FUNCTION app_private.is_circle_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.circle_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_circle_role(UUID, UUID, public.app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.is_circle_member(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION app_private.circle_role(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION app_private.has_circle_role(UUID, UUID, public.app_role[]) TO service_role;

DROP POLICY IF EXISTS "Members can view their circles" ON public.care_circles;
DROP POLICY IF EXISTS "Admins can update circles" ON public.care_circles;
DROP POLICY IF EXISTS "Admins can delete circles" ON public.care_circles;
CREATE POLICY "Members can view their circles"
  ON public.care_circles FOR SELECT TO authenticated
  USING (app_private.is_circle_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "Admins can update circles"
  ON public.care_circles FOR UPDATE TO authenticated
  USING (app_private.has_circle_role(id, auth.uid(), ARRAY['admin']::public.app_role[]));
CREATE POLICY "Admins can delete circles"
  ON public.care_circles FOR DELETE TO authenticated
  USING (app_private.has_circle_role(id, auth.uid(), ARRAY['admin']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view circle membership" ON public.circle_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.circle_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.circle_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.circle_members;
CREATE POLICY "Members can view circle membership"
  ON public.circle_members FOR SELECT TO authenticated
  USING (app_private.is_circle_member(circle_id, auth.uid()) OR user_id = auth.uid());
CREATE POLICY "Admins can add members"
  ON public.circle_members FOR INSERT TO authenticated
  WITH CHECK (
    app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[])
    OR EXISTS (SELECT 1 FROM public.care_circles WHERE id = circle_id AND created_by = auth.uid())
  );
CREATE POLICY "Admins can update members"
  ON public.circle_members FOR UPDATE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));
CREATE POLICY "Admins can remove members"
  ON public.circle_members FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]) OR user_id = auth.uid());

DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins/coordinators can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins/coordinators can delete tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Members can update tasks"
  ON public.tasks FOR UPDATE TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view medications" ON public.medications;
DROP POLICY IF EXISTS "Admins/coordinators can create medications" ON public.medications;
DROP POLICY IF EXISTS "Admins/coordinators can update medications" ON public.medications;
DROP POLICY IF EXISTS "Admins/coordinators can delete medications" ON public.medications;
CREATE POLICY "Members can view medications"
  ON public.medications FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create medications"
  ON public.medications FOR INSERT TO authenticated
  WITH CHECK (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can update medications"
  ON public.medications FOR UPDATE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can delete medications"
  ON public.medications FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view medication logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Members can log medication doses" ON public.medication_logs;
DROP POLICY IF EXISTS "Admins/coordinators can delete logs" ON public.medication_logs;
CREATE POLICY "Members can view medication logs"
  ON public.medication_logs FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can log medication doses"
  ON public.medication_logs FOR INSERT TO authenticated
  WITH CHECK (app_private.is_circle_member(circle_id, auth.uid()) AND logged_by = auth.uid());
CREATE POLICY "Admins/coordinators can delete logs"
  ON public.medication_logs FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]) OR logged_by = auth.uid());

DROP POLICY IF EXISTS "Members can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins/coordinators can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins/coordinators can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins/coordinators can delete appointments" ON public.appointments;
CREATE POLICY "Members can view appointments"
  ON public.appointments FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can create appointments"
  ON public.appointments FOR INSERT TO authenticated
  WITH CHECK (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can update appointments"
  ON public.appointments FOR UPDATE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));
CREATE POLICY "Admins/coordinators can delete appointments"
  ON public.appointments FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view requests" ON public.patient_requests;
DROP POLICY IF EXISTS "Members can create requests" ON public.patient_requests;
DROP POLICY IF EXISTS "Members can update requests" ON public.patient_requests;
DROP POLICY IF EXISTS "Admins/coordinators can delete requests" ON public.patient_requests;
CREATE POLICY "Members can view requests"
  ON public.patient_requests FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can create requests"
  ON public.patient_requests FOR INSERT TO authenticated
  WITH CHECK (app_private.is_circle_member(circle_id, auth.uid()) AND patient_id = auth.uid());
CREATE POLICY "Members can update requests"
  ON public.patient_requests FOR UPDATE TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Admins/coordinators can delete requests"
  ON public.patient_requests FOR DELETE TO authenticated
  USING (app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin','coordinator']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view moods" ON public.patient_moods;
DROP POLICY IF EXISTS "Members can log own moods" ON public.patient_moods;
DROP POLICY IF EXISTS "Patient or admin can delete moods" ON public.patient_moods;
CREATE POLICY "Members can view moods"
  ON public.patient_moods FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can log own moods"
  ON public.patient_moods FOR INSERT TO authenticated
  WITH CHECK (app_private.is_circle_member(circle_id, auth.uid()) AND patient_id = auth.uid());
CREATE POLICY "Patient or admin can delete moods"
  ON public.patient_moods FOR DELETE TO authenticated
  USING (patient_id = auth.uid() OR app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));

DROP POLICY IF EXISTS "Members can view feed" ON public.feed_posts;
DROP POLICY IF EXISTS "Members can post to feed" ON public.feed_posts;
DROP POLICY IF EXISTS "Authors or admins can delete posts" ON public.feed_posts;
CREATE POLICY "Members can view feed"
  ON public.feed_posts FOR SELECT TO authenticated USING (app_private.is_circle_member(circle_id, auth.uid()));
CREATE POLICY "Members can post to feed"
  ON public.feed_posts FOR INSERT TO authenticated
  WITH CHECK (app_private.is_circle_member(circle_id, auth.uid()) AND author_id = auth.uid());
CREATE POLICY "Authors or admins can delete posts"
  ON public.feed_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR app_private.has_circle_role(circle_id, auth.uid(), ARRAY['admin']::public.app_role[]));

REVOKE EXECUTE ON FUNCTION public.is_circle_member(UUID, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.circle_role(UUID, UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_circle_role(UUID, UUID, public.app_role[]) FROM authenticated;