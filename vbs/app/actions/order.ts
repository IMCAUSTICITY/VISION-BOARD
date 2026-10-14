"use server"
import { orderSchema, type OrderValues } from "@/lib/schema"
import { MAX_PHOTOS } from "@/lib/constants"
import { supabaseAdmin } from "@/lib/supabase/server"
import { orderCode } from "@/lib/utils"
import { sendConfirmation } from "@/lib/email"

type Photo = { path: string; name: string; size: number }

// Public intake. Photos were already uploaded straight from the browser to the private
// "client-photos" bucket (avoids server body-size limits); here we only record their paths.
export async function submitOrder(input: OrderValues, photos: Photo[]) {
  const v = orderSchema.parse(input)
  if (photos.length > MAX_PHOTOS[v.tier]) throw new Error(`${v.tier} allows up to ${MAX_PHOTOS[v.tier]} photos`)
  if (photos.some((p) => !/^[0-9a-f-]{36}\//.test(p.path))) throw new Error("Invalid upload path")
  const db = supabaseAdmin()

  const { data: client, error: ce } = await db.from("clients")
    .upsert({ name: v.name, email: v.email.toLowerCase(), phone: v.phone || null, region: v.region }, { onConflict: "email" })
    .select("id").single()
  if (ce) throw new Error(ce.message)

  const { data: order, error: oe } = await db.from("orders").insert({
    client_id: client.id, tier: v.tier, print_addon: v.printAddon, goals: v.goals,
    style: v.style, colors: v.colors, notes: v.notes || null,
  }).select("id, order_number").single()
  if (oe) throw new Error(oe.message)

  if (photos.length) {
    await db.from("files").insert(photos.map((p) => ({
      order_id: order.id, kind: "client_photo", bucket: "client-photos", path: p.path, filename: p.name, size_bytes: p.size,
    })))
  }
  const code = orderCode(order.order_number)
  try { await sendConfirmation(v.email, v.name, code, v.tier) } catch (e) { console.error("Confirmation email failed", e) }
  return { code }
}
