"use client"
import { useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dropzone } from "@/components/dropzone"
import { PhotoGrid, type SignedFile } from "@/components/photo-grid"
import { STATUSES } from "@/lib/constants"
import { updateOrder, registerFinalFile } from "@/app/admin/actions"
import { supabaseBrowser } from "@/lib/supabase/client"

export function OrderControls({ id, status, payment, notes, finals }: { id: string; status: string; payment: string; notes: string; finals: SignedFile[] }) {
  const [, start] = useTransition()
  const [text, setText] = useState(notes)
  const [saved, setSaved] = useState(true)
  const first = useRef(true)

  // Autosave founder notes 800 ms after typing stops
  useEffect(() => {
    if (first.current) { first.current = false; return }
    setSaved(false)
    const t = setTimeout(async () => { await updateOrder(id, { founder_notes: text }); setSaved(true) }, 800)
    return () => clearTimeout(t)
  }, [text, id])

  const patch = (p: Parameters<typeof updateOrder>[1], msg: string) =>
    start(async () => { try { await updateOrder(id, p); toast.success(msg) } catch { toast.error("Couldn't save that change") } })

  async function upload(files: File[]) {
    const sb = supabaseBrowser()
    for (const f of files) {
      const path = `${id}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`
      const { error } = await sb.storage.from("final-boards").upload(path, f, { contentType: f.type })
      if (error) { toast.error(`Upload failed: ${f.name}`); continue }
      await registerFinalFile(id, path, f.name, f.size)
      toast.success(`Uploaded ${f.name}`)
    }
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-xl shadow-soft"><CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select defaultValue={status} onValueChange={(v) => patch({ status: v }, "Status updated")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex items-center justify-between">
            <span className="text-sm">Payment</span>
            <div className="flex rounded-lg border p-0.5">
              {(["unpaid", "paid"] as const).map((p) => (
                <Button key={p} type="button" size="sm" variant={payment === p ? "default" : "ghost"} className="capitalize"
                  onClick={() => payment !== p && patch({ payment_status: p }, `Marked ${p}`)}>{p}</Button>))}
            </div>
          </div>
        </CardContent></Card>

      <Card className="rounded-xl shadow-soft"><CardHeader><CardTitle className="text-base">Private notes</CardTitle></CardHeader>
        <CardContent><Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Only you can see this" />
          <p className="mt-1 text-xs text-muted-foreground">{saved ? "Saved" : "Saving…"}</p></CardContent></Card>

      <Card className="rounded-xl shadow-soft"><CardHeader><CardTitle className="text-base">Final board</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Dropzone onFiles={upload} accept="image/*,application/pdf" label="Upload final board" hint="PNG, JPG or PDF" />
          <PhotoGrid files={finals} isImage={false} />
        </CardContent></Card>
    </div>
  )
}
