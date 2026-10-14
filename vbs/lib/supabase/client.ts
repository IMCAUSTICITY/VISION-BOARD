import { createBrowserClient } from "@supabase/ssr"

export const supabaseBrowser = () => {
  // Only NEXT_PUBLIC_* variables are available in the browser bundle.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

  if (!url || !anonKey || url.includes("YOUR-PROJECT") || anonKey.includes("your-anon-key") || url.includes("example.com")) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL_3 and SUPABASE_PUBLISHABLE_KEY_3 in the project environment.")
  }

  return createBrowserClient(url, anonKey)
}
