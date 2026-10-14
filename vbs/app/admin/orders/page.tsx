import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/server"
import { fmtDate, orderCode } from "@/lib/utils"
import { STATUSES } from "@/lib/constants"

export const dynamic = "force-dynamic"
const sel = "h-10 rounded-md border border-input bg-card px-3 text-sm"

export default async function Orders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin()
  const { status, tier, q, sort } = await searchParams
  let query = supabaseAdmin().from("orders")
    .select("id, order_number, tier, print_addon, status, created_at, clients!inner(name, email, region)")
    .order("created_at", { ascending: sort === "asc" })
  if (status) query = query.eq("status", status)
  if (tier) query = query.eq("tier", tier)
  if (q) query = query.or(`name.ilike.%${q.replace(/[%,]/g, "")}%,email.ilike.%${q.replace(/[%,]/g, "")}%`, { referencedTable: "clients" })
  const { data: orders = [] } = await query
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Orders</h1>
      <form className="flex flex-wrap gap-2">
        <Input name="q" defaultValue={q} placeholder="Search name or email" className="w-full sm:w-64" />
        <select name="status" defaultValue={status ?? ""} className={sel}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
        <select name="tier" defaultValue={tier ?? ""} className={sel}><option value="">All tiers</option><option value="basic">Basic</option><option value="premium">Premium</option></select>
        <select name="sort" defaultValue={sort ?? "desc"} className={sel}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select>
        <Button>Apply</Button>
      </form>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-soft">
        <Table>
          <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Client</TableHead><TableHead>Tier</TableHead><TableHead>Region</TableHead><TableHead>Add-on</TableHead><TableHead>Submitted</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {orders!.length === 0 && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">No orders match these filters.</TableCell></TableRow>}
            {orders!.map((o: any) => (
              <TableRow key={o.id} className="hover:bg-accent/40">
                <TableCell><Link href={`/admin/orders/${o.id}`} className="font-medium text-primary">{orderCode(o.order_number)}</Link></TableCell>
                <TableCell>{o.clients.name}<div className="text-xs text-muted-foreground">{o.clients.email}</div></TableCell>
                <TableCell className="capitalize">{o.tier}</TableCell>
                <TableCell>{o.clients.region === "india" ? "India" : "Global"}</TableCell>
                <TableCell>{o.print_addon ? <Badge variant="outline">Print & Ship</Badge> : "—"}</TableCell>
                <TableCell>{fmtDate(o.created_at)}</TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
              </TableRow>))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
