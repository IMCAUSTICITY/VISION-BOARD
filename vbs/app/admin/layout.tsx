import Link from "next/link"
import { signOut } from "./actions"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="font-display text-lg font-semibold text-primary">VisionBoard Studio</Link>
            <Link href="/admin" className="hover:text-primary">Dashboard</Link>
            <Link href="/admin/orders" className="hover:text-primary">Orders</Link>
          </nav>
          <form action={signOut}><Button variant="ghost" size="sm">Sign out</Button></form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
