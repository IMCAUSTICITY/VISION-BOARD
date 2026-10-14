import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PricingCards } from "@/components/pricing-cards"
import { MessageCircleHeart, Palette, PackageCheck } from "lucide-react"

const STEPS = [
  { icon: MessageCircleHeart, title: "Share your goals", text: "Tell me what you're working toward and send the photos that matter." },
  { icon: Palette, title: "I design your board", text: "I lay out your goals in the style you picked, by hand." },
  { icon: PackageCheck, title: "Receive & revise", text: "Get your board by email, ask for changes, or have it printed and shipped." },
]
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24">
      <section className="py-20 text-center sm:py-28">
        <h1 className="mx-auto max-w-2xl text-4xl font-semibold leading-tight sm:text-6xl">A vision board made for the life you're building</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Custom boards, designed by hand around your goals, your photos and your style.</p>
        <Button asChild size="lg" className="mt-8 rounded-xl"><Link href="/order">Start your order</Link></Button>
      </section>
      <section className="grid gap-5 sm:grid-cols-3">
        {STEPS.map(({ icon: I, title, text }) => (
          <div key={title} className="rounded-xl bg-card p-6 shadow-soft">
            <I className="mb-4 h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
      <section className="mt-24"><h2 className="mb-8 text-center text-3xl font-semibold">Pricing</h2><PricingCards /></section>
    </main>
  )
}
