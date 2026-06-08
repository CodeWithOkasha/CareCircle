import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

type TableSub = { table: string; filter?: string };

/**
 * Subscribe to realtime postgres changes on one or more tables.
 * Calls `onChange` for every event. Cleans up on unmount or dep change.
 */
export function useRealtime(channelName: string, subs: TableSub[], onChange: () => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!subs.length) return;
    const ch = supabase.channel(channelName);
    subs.forEach((s) => {
      (ch as unknown as { on: (...a: unknown[]) => unknown }).on(
        "postgres_changes",
        { event: "*", schema: "public", table: s.table, ...(s.filter ? { filter: s.filter } : {}) },
        () => onChangeRef.current(),
      );
    });
    ch.subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [channelName, JSON.stringify(subs)]);
}
