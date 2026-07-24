export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export class SupabaseConfigurationError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a Supabase publishable key.",
    );
    this.name = "SupabaseConfigurationError";
  }
}

export function getSupabaseConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !publishableKey) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
      return null;
    }
  } catch {
    return null;
  }

  return { url, publishableKey };
}

export function requireSupabaseConfig(): SupabasePublicConfig {
  const config = getSupabaseConfig();
  if (!config) throw new SupabaseConfigurationError();
  return config;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}
