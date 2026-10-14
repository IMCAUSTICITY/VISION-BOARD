import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/server"
import { fmtDate, orderCode } from "@/lib/utils"
import { STATUSES } from "@/lib/constants"

export const dynamic = "force-dynamic"
export default async function Dashboard() {
  await requireAdmin()
  const db = supabaseAdmin()
  const { data: all = [] } = await db.from("orders").select("status, created_at")
  const now = new Date(), week = new Date(now.getTime() - 7 * 864e5), monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const count = (s: string) => all!.filter((o) => o.status === s).length
  const stats = [
    ...STATUSES.map((s) => ({ label: s.label, value: count(s.value) })),
    { label: "This week", value: all!.filter((o) => new Date(o.created_at) >= week).length },
    { label: "This month", value: all!.filter((o) => new Date(o.created_at) >= monthStart).length },
  ]
  const { data: recent = [] } = await db.from("orders")
    .select("id, order_number, tier, status, created_at, clients(name)").order("created_at", { ascending: false }).limit(6)
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (<Card key={s.label} className="rounded-xl shadow-soft"><CardContent className="p-4"><p className="text-3xl font-semibold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></CardContent></Card>))}
      </div>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Recent orders</h2><Link href="/admin/orders" className="text-sm text-primary">View all</Link></div>
        <Card className="divide-y rounded-xl shadow-soft">
          {recent!.length === 0 && <p className="p-6 text-sm text-muted-foreground">No orders yet. Share your order link to get the first one.</p>}
          {recent!.map((o: any) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-accent/40">
              <div><p className="font-medium">{o.clients?.name}</p><p className="text-xs text-muted-foreground">{orderCode(o.order_number)} · {o.tier} · {fmtDate(o.created_at)}</p></div>
              <StatusBadge status={o.status} />
            </Link>))}
        </Card>
      </section>
    </div>
  )
}
