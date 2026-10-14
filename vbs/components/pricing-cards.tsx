"use client"
import { useState } from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRICING } from "@/lib/constants"

const PLANS = [
  { key: "basic", name: "Basic", features: ["Single-theme board", "Up to 8 images", "1 revision"] },
  { key: "premium", name: "Premium", features: ["Multi-section board", "Custom typography", "2 revisions"], featured: true },
] as const

export function PricingCards() {
  const [region, setRegion] = useState<"india" | "global">("india")
  return (
    <div className="space-y-8">
      <Tabs value={region} onValueChange={(v) => setRegion(v as "india" | "global")} className="flex justify-center">
        <TabsList><TabsTrigger value="india">India ₹</TabsTrigger><TabsTrigger value="global">Global $</TabsTrigger></TabsList>
      </Tabs>
      <div className="grid gap-5 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.key} className={`rounded-xl shadow-soft ${"featured" in p ? "border-primary" : ""}`}>
            <CardHeader><CardTitle className="text-xl">{p.name}</CardTitle>
              <CardDescription className="text-2xl font-semibold text-foreground">{PRICING[p.key][region]}</CardDescription></CardHeader>
            <CardContent><ul className="space-y-2 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}
            </ul></CardContent>
          </Card>
        ))}
        <Card className="rounded-xl bg-accent/50 shadow-soft">
          <CardHeader><CardTitle className="text-xl">Print & Ship</CardTitle>
            <CardDescription className="text-2xl font-semibold text-foreground">{PRICING.addon[region]}</CardDescription></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Add to any board and I'll print it and send it to your door.</CardContent>
        </Card>
      </div>
      <div className="text-center"><Button asChild size="lg" className="rounded-xl"><Link href="/order">Start your order</Link></Button></div>
    </div>
  )
}
