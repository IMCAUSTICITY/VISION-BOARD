import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
export default async function Success({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
      <CheckCircle2 className="h-14 w-14 text-primary" />
      <h1 className="mt-5 text-3xl font-semibold">Your order is in</h1>
      <p className="mt-3 rounded-xl bg-accent px-4 py-2 font-mono text-lg">{id ?? "—"}</p>
      <p className="mt-4 text-muted-foreground">A confirmation email is on its way. Keep your order ID handy if you write to me about your board.</p>
      <Button asChild variant="outline" className="mt-8 rounded-xl"><Link href="/">Back to home</Link></Button>
    </main>
  )
}
