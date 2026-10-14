import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { PhotoGrid, type SignedFile } from "@/components/photo-grid"
import { OrderControls } from "@/components/order-controls"
import { requireAdmin, supabaseAdmin } from "@/lib/supabase/server"
import { fmtDate, orderCode } from "@/lib/utils"
import { PRICING } from "@/lib/constants"

export const dynamic = "force-dynamic"
export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const db = supabaseAdmin()
  const { data: o } = await db.from("orders").select("*, clients(*), files(*)").eq("id", id).single()
  if (!o) notFound()

  const sign = async (kind: string): Promise<SignedFile[]> =>
    Promise.all(o.files.filter((f: any) => f.kind === kind).map(async (f: any) => {
      const bucket = db.storage.from(f.bucket)
      const [view, dl] = await Promise.all([bucket.createSignedUrl(f.path, 3600), bucket.createSignedUrl(f.path, 3600, { download: f.filename ?? true })])
      return { id: f.id, name: f.filename ?? f.path, url: view.data?.signedUrl ?? "", downloadUrl: dl.data?.signedUrl ?? "" }
    }))
  const [photos, finals] = await Promise.all([sign("client_photo"), sign("final_board")])
  const c = o.clients
  const rows: [string, string][] = [
    ["Email", c.email], ["Phone", c.phone ?? "—"], ["Region", c.region === "india" ? "India" : "Global"],
    ["Tier", `${o.tier} · ${PRICING[o.tier as "basic" | "premium"][c.region as "india" | "global"]}`],
    ["Print & Ship", o.print_addon ? "Yes" : "No"], ["Style", o.style ?? "—"], ["Submitted", fmtDate(o.created_at)],
  ]
  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />All orders</Link>
      <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold">{orderCode(o.order_number)} · {c.name}</h1><StatusBadge status={o.status} /></div>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div className="space-y-5">
          <Card className="rounded-xl shadow-soft"><CardHeader><CardTitle className="text-base">Intake answers</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="capitalize">{v}</dd></div>)}</dl>
              {o.colors.length > 0 && <div className="flex gap-2">{o.colors.map((col: string) => <span key={col} title={col} className="h-7 w-7 rounded-full border" style={{ background: col }} />)}</div>}
              {o.goals.map((g: any) => <div key={g.category}><Badge variant="secondary">{g.category}</Badge><p className="mt-1 text-sm">{g.details}</p></div>)}
              {o.notes && <div><p className="text-sm text-muted-foreground">Client notes</p><p className="text-sm">{o.notes}</p></div>}
            </CardContent></Card>
          <Card className="rounded-xl shadow-soft"><CardHeader><CardTitle className="text-base">Client photos ({photos.length})</CardTitle></CardHeader>
            <CardContent><PhotoGrid files={photos} /></CardContent></Card>
        </div>
        <OrderControls id={o.id} status={o.status} payment={o.payment_status} notes={o.founder_notes} finals={finals} />
      </div>
    </div>
  )
}
