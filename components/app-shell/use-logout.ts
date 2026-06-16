"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

/**
 * Déconnexion : ferme la session Supabase (mode réel) puis renvoie vers /login.
 * En mode démo, redirige simplement vers /login.
 */
export function useLogout() {
  const router = useRouter();
  return React.useCallback(async () => {
    if (isSupabaseConfigured()) {
      try {
        await createClient().auth.signOut();
      } catch {
        /* on redirige malgré tout */
      }
    }
    router.push("/login");
    router.refresh();
  }, [router]);
}
