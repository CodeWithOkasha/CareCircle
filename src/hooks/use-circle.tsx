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

    // Find a circle the user belongs to
    const { data: mems } = await supabase
      .from("circle_members")
      .select("circle_id")
      .eq("user_id", user.id)
      .limit(1);

    let circleId = mems?.[0]?.circle_id as string | undefined;

    if (!circleId) {
      // Bootstrap: create first circle and add user as admin
      const name = profile?.full_name ? `${profile.full_name}'s Care Circle` : "My Care Circle";
      const { data: created, error } = await supabase
        .from("care_circles")
        .insert({ name, created_by: user.id })
        .select()
        .single();
      if (!error && created) {
        circleId = created.id as string;
        // first member is admin regardless of stored profile role so they can manage
        await supabase.from("circle_members").insert({
          circle_id: circleId,
          user_id: user.id,
          role: "admin",
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
  }, [user, profile?.full_name]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: refresh members when membership changes
  useEffect(() => {
    if (!circle) return;
    const ch = supabase
      .channel(`circle:${circle.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "circle_members", filter: `circle_id=eq.${circle.id}` },
        () => load(),
      )
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
