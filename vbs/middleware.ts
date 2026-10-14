import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Protects /admin/*. Landing page and /order stay public.
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
        list.forEach(({ name, value }) => req.cookies.set(name, value))
        res = NextResponse.next({ request: req })
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options as any))
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  const allowed = !!user?.email && (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map((e) => e.trim()).includes(user.email.toLowerCase())
  const onLogin = req.nextUrl.pathname === "/admin/login"
  if (!allowed && !onLogin) return NextResponse.redirect(new URL("/admin/login", req.url))
  if (allowed && onLogin) return NextResponse.redirect(new URL("/admin", req.url))
  return res
}
export const config = { matcher: ["/admin/:path*"] }
