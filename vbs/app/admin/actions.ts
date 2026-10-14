"use server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireAdmin, supabaseAdmin, supabaseServer } from "@/lib/supabase/server"

export async function updateOrder(id: string, patch: { status?: string; payment_status?: string; founder_notes?: string }) {
  await requireAdmin()
  const { error } = await supabaseAdmin().from("orders").update(patch).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin", "layout")
}
export async function registerFinalFile(orderId: string, path: string, name: string, size: number) {
  await requireAdmin()
  const { error } = await supabaseAdmin().from("files").insert({ order_id: orderId, kind: "final_board", bucket: "final-boards", path, filename: name, size_bytes: size })
  if (error) throw new Error(error.message)
  revalidatePath(`/admin/orders/${orderId}`)
}
export async function signOut() {
  await (await supabaseServer()).auth.signOut()
  redirect("/admin/login")
}
