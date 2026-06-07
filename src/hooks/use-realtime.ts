import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type TableSub = { table: string; filter?: string };

/**
 * Subscribe to realtime postgres changes on one or more tables.
 * Calls `onChange` for every event. Cleans up on unmount or dep change.
 */
export function useRealtime(channelName: string, subs: TableSub[], onChange: () => void) {
  useEffect(() => {
    if (!subs.length) return;
    const ch = supabase.channel(channelName);
    subs.forEach((s) => {
      ch.on(
        // @ts-expect-error generic event signature
        "postgres_changes",
        { event: "*", schema: "public", table: s.table, ...(s.filter ? { filter: s.filter } : {}) },
        () => onChange(),
      );
    });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, JSON.stringify(subs)]);
}
