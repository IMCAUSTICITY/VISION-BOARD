import { createServerClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ensureRealSupabaseValue = (name: string, value: string | undefined, allowPlaceholderText = ["YOUR-PROJECT", "your-anon-key", "your-service-role-key", "process.env."]) => {
  if (!value || allowPlaceholderText.some((placeholder) => value.includes(placeholder))) {
    throw new Error(`Missing or placeholder Supabase value for ${name}. Set the real value in the project environment before submitting orders.`)
  }
  return value
}

const firstRealValue = (...values: Array<string | undefined>) =>
  values.find((value) => value && !value.includes("process.env.") && !value.includes("YOUR-PROJECT") && !value.includes("your-anon-key") && !value.includes("your-service-role-key"))

const supabaseUrl = () => firstRealValue(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL, process.env.SUPABASE_URL_3)
const supabasePublishableKey = () => firstRealValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, process.env.SUPABASE_PUBLISHABLE_KEY, process.env.SUPABASE_PUBLISHABLE_KEY_3, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabaseSecretKey = () => firstRealValue(process.env.SUPABASE_SECRET_KEY, process.env.SUPABASE_SECRET_KEY_3, process.env.SUPABASE_SERVICE_ROLE_KEY)

/** Session-aware client (reads the founder's login cookie). */
export async function supabaseServer() {
  const store = await cookies()
  const url = ensureRealSupabaseValue("SUPABASE_URL", supabaseUrl())
  const anonKey = ensureRealSupabaseValue("SUPABASE_PUBLISHABLE_KEY", supabasePublishableKey())
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
  const url = ensureRealSupabaseValue("SUPABASE_URL", supabaseUrl())
  const serviceRoleKey = ensureRealSupabaseValue("SUPABASE_SECRET_KEY", supabaseSecretKey())
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } })
}

export const isAdminEmail = (email?: string | null) =>
  !!email && (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).includes(email.toLowerCase())

export async function requireAdmin() {
  const { data: { user } } = await (await supabaseServer()).auth.getUser()
  if (!isAdminEmail(user?.email)) redirect("/admin/login")
  return user!
}
