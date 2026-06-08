import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "./use-auth";

export type Circle = {
  id: string;
  name: string;
  patient_name: string | null;
  created_by: string;
  created_at?: string;
};

export type CircleMember = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at?: string;
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type Ctx = {
  circle: Circle | null;
  members: CircleMember[];
  myRole: AppRole | null;
  loading: boolean;
  reload: () => Promise<void>;
};

const CircleCtx = createContext<Ctx | null>(null);

export function CircleProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setCircle(null);
      setMembers([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const preferredRole: AppRole = (user.user_metadata?.role as AppRole | undefined) ?? profile?.role ?? "helper";

    // Find the newest circle the user belongs to so duplicate bootstrap attempts do not pin them to stale data.
    const { data: mems } = await supabase
      .from("circle_members")
      .select("circle_id, care_circles(created_at)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    let circleId = mems?.[0]?.circle_id as string | undefined;

    if (!circleId) {
      // Bootstrap: create first circle and keep the signup role selected by the user.
      const name = profile?.full_name ? `${profile.full_name}'s Care Circle` : "My Care Circle";
      const { data: created, error } = await supabase
        .from("care_circles")
        .insert({ name, created_by: user.id })
        .select()
        .single();
      if (!error && created) {
        circleId = created.id as string;
        await supabase.from("circle_members").insert({
          circle_id: circleId,
          user_id: user.id,
          role: preferredRole,
        });
      }
    }

    if (circleId) {
      const [{ data: c }, { data: m }] = await Promise.all([
        supabase.from("care_circles").select("*").eq("id", circleId).maybeSingle(),
        supabase.from("circle_members").select("*").eq("circle_id", circleId).order("created_at"),
      ]);
      setCircle((c as Circle) ?? null);
      const memberRows = (m as Omit<CircleMember, "profile">[] | null) ?? [];
      const userIds = memberRows.map((x) => x.user_id);
      const { data: profs } = userIds.length
        ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
        : { data: [] as { id: string; full_name: string | null; avatar_url: string | null }[] };
      setMembers(
        memberRows.map((mem) => ({
          ...mem,
          profile: profs?.find((p) => p.id === mem.user_id) ?? null,
        })),
      );
    }
    setLoading(false);
  }, [user, profile?.full_name, profile?.role]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh circle, member, and profile data when any connected client changes them.
  useEffect(() => {
    if (!circle) return;
    const ch = supabase
      .channel(`circle:${circle.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circle_members", filter: `circle_id=eq.${circle.id}` },
        () => load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "care_circles", filter: `id=eq.${circle.id}` },
        () => load(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [circle?.id, load]);

  const myRole = members.find((m) => m.user_id === user?.id)?.role ?? null;

  return (
    <CircleCtx.Provider value={{ circle, members, myRole, loading, reload: load }}>
      {children}
    </CircleCtx.Provider>
  );
}

export function useCircle() {
  const ctx = useContext(CircleCtx);
  if (!ctx) throw new Error("useCircle must be used inside <CircleProvider>");
  return ctx;
}

export function canEditCareData(role: AppRole | null) {
  return role === "admin" || role === "coordinator";
}
export function isAdmin(role: AppRole | null) {
  return role === "admin";
}
