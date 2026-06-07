GRANT EXECUTE ON FUNCTION public.is_circle_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.circle_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_circle_role(UUID, UUID, public.app_role[]) TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_circle_member(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.circle_role(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_circle_role(UUID, UUID, public.app_role[]) TO service_role;