import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ensureRealSupabaseValue = (name: string, value: string | undefined, allowPlaceholderText = ["YOUR-PROJECT", "your-anon-key", "your-service-role-key"]) => {
  if (!value || allowPlaceholderText.some((placeholder) => value.includes(placeholder))) {
    throw new Error(`Missing or placeholder Supabase value for ${name}. Set the real value in .env.local before submitting orders.`)
  }
  return value
}

/** Session-aware client (reads the founder's login cookie). */
export async function supabaseServer() {
  const store = await cookies()
  const url = ensureRealSupabaseValue("SUPABASE_URL_3", process.env.SUPABASE_URL_3 ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)
  const anonKey = ensureRealSupabaseValue("SUPABASE_PUBLISHABLE_KEY_3", process.env.SUPABASE_PUBLISHABLE_KEY_3 ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options as any))
        } catch {
          // Ignore cookie-store write errors during server render / redirect flows.
        }
      },
    },
  })
}
/** Service-role client: bypasses RLS. Server-only. Use after checking requireAdmin() or for the public intake action. */
export const supabaseAdmin = () => {
  const url = ensureRealSupabaseValue("SUPABASE_URL_3", process.env.SUPABASE_URL_3 ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)
  const serviceRoleKey = ensureRealSupabaseValue("SUPABASE_SECRET_KEY_3", process.env.SUPABASE_SECRET_KEY_3 ?? process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

export const isAdminEmail = (email?: string | null) =>
  !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase())

export async function requireAdmin() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser()
  if (!isAdminEmail(user?.email)) redirect("/admin/login")
  return user!
}
