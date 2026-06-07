ALTER TABLE public.care_circles REPLICA IDENTITY FULL;
ALTER TABLE public.circle_members REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.care_circles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.circle_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;