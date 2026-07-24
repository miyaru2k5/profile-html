import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseServerKey,
  getSupabaseUrl,
} from "@/infrastructure/supabase/env";

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

export function createBrowserSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error("Chưa cấu hình Supabase (thiếu URL / publishable key)");
  }
  if (!browserClient) {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

/** Server client — uses service role when available, otherwise publishable key. */
export function createServerSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServerKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured (URL / key missing)");
  }
  if (!serverClient) {
    serverClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClient;
}
