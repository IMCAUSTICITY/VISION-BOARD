import { createBrowserClient } from "@supabase/ssr"

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

  if (!url || !anonKey || url.includes("YOUR-PROJECT") || anonKey.includes("your-anon-key") || url.includes("example.com")) {
    throw new Error("Supabase is not configured yet. Update NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with your real project values.")
  }

  return createBrowserClient(url, anonKey)
}
