"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Check, Loader2, Plus, X } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dropzone } from "@/components/dropzone"
import { orderSchema, type OrderValues } from "@/lib/schema"
import { GOALS, STYLES, STYLE_SWATCHES, PRICING, MAX_PHOTOS } from "@/lib/constants"
import { supabaseBrowser } from "@/lib/supabase/client"
import { submitOrder } from "@/app/actions/order"
import { cn } from "@/lib/utils"

const STEPS = ["About you", "Tier", "Goals", "Style", "Photos & notes", "Review"]
const STEP_FIELDS: (keyof OrderValues)[][] = [["name", "email", "phone", "region"], ["tier", "printAddon"], ["goals"], ["style", "colors"], ["notes"], []]

export default function OrderForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const form = useForm<OrderValues>({
    resolver: zodResolver(orderSchema), mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", region: "india", tier: "basic", printAddon: false, goals: [], colors: [], notes: "" },
  })
  const v = form.watch()
  const maxPhotos = MAX_PHOTOS[v.tier]
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  const next = async () => { if (await form.trigger(STEP_FIELDS[step])) setStep((s) => s + 1) }
  const addFiles = (incoming: File[]) => {
    const ok = incoming.filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
    if (ok.length < incoming.length) toast.error("Only images up to 10 MB are accepted")
    const merged = [...files, ...ok]
    if (merged.length > maxPhotos) toast.error(`${v.tier === "basic" ? "Basic" : "Premium"} allows up to ${maxPhotos} images`)
    setFiles(merged.slice(0, maxPhotos))
  }
  const toggleGoal = (c: (typeof GOALS)[number]) => {
    const cur = form.getValues("goals")
    form.setValue("goals", cur.some((g) => g.category === c) ? cur.filter((g) => g.category !== c) : [...cur, { category: c, details: "" }], { shouldValidate: form.formState.isSubmitted || cur.length > 0 })
  }

  async function onSubmit(values: OrderValues) {
    setBusy(true)
    try {
      const sb = supabaseBrowser(), session = crypto.randomUUID()
      const photos = []
      for (const [i, f] of files.entries()) {
        const path = `${session}/${i}-${f.name.replace(/[^\w.-]/g, "_")}`
        const { error } = await sb.storage.from("client-photos").upload(path, f, { contentType: f.type })
        if (error) throw error
        photos.push({ path, name: f.name, size: f.size })
      }
      const { code } = await submitOrder(values, photos)
      router.push(`/order/success?id=${code}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong sending your order. Please try again."
      toast.error(message)
      setBusy(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <p className="mb-2 text-sm text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
        </div>

        <Card className="rounded-xl shadow-soft"><CardContent className="space-y-5 p-6">
          {step === 0 && (<>
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input autoComplete="name" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone (optional)</FormLabel><FormControl><Input type="tel" autoComplete="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="region" render={({ field }) => (<FormItem><FormLabel>Region</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="india">India</SelectItem><SelectItem value="global">Global</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
          </>)}

          {step === 1 && (<>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["basic", "premium"] as const).map((t) => (
                <button type="button" key={t} onClick={() => form.setValue("tier", t)}
                  className={cn("rounded-xl border-2 p-4 text-left transition-colors", v.tier === t ? "border-primary bg-accent" : "border-input")}>
                  <p className="font-display text-lg font-semibold capitalize">{t}</p>
                  <p className="text-xl font-semibold">{PRICING[t][v.region]}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t === "basic" ? "Single theme, up to 8 images, 1 revision" : "Multi-section, custom typography, 2 revisions"}</p>
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
              <Checkbox checked={v.printAddon} onCheckedChange={(c) => form.setValue("printAddon", c === true)} />
              <span className="text-sm"><b>Print & Ship</b> {PRICING.addon[v.region]}</span>
            </label>
          </>)}

          {step === 2 && (<>
            <p className="text-sm text-muted-foreground">Choose the areas you want on your board.</p>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => { const on = v.goals.some((x) => x.category === g); return (
                <button type="button" key={g} onClick={() => toggleGoal(g)} aria-pressed={on}
                  className={cn("flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition-colors", on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/60")}>
                  {on && <Check className="h-3.5 w-3.5" />}{g}</button>) })}
            </div>
            {typeof form.formState.errors.goals?.message === "string" && <p className="text-sm text-destructive">{form.formState.errors.goals.message}</p>}
            {v.goals.map((g, i) => (
              <FormField key={g.category} control={form.control} name={`goals.${i}.details`} render={({ field }) => (
                <FormItem><FormLabel>{g.category}</FormLabel><FormControl><Textarea rows={3} placeholder={`What does success in ${g.category.toLowerCase()} look like for you?`} {...field} /></FormControl><FormMessage /></FormItem>)} />
            ))}
          </>)}

          {step === 3 && (<>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button type="button" key={s} onClick={() => form.setValue("style", s, { shouldValidate: true })}
                  className={cn("rounded-xl border-2 p-3 text-left transition-colors", v.style === s ? "border-primary bg-accent" : "border-input")}>
                  <div className="mb-2 flex h-10 overflow-hidden rounded-lg">{STYLE_SWATCHES[s].map((c) => <div key={c} className="flex-1" style={{ background: c }} />)}</div>
                  <p className="text-sm font-medium">{s}</p>
                </button>
              ))}
            </div>
            {form.formState.errors.style && <p className="text-sm text-destructive">{form.formState.errors.style.message}</p>}
            <div>
              <p className="mb-2 text-sm font-medium">Preferred colors (optional)</p>
              <div className="flex flex-wrap items-center gap-2">
                {v.colors.map((c) => (
                  <span key={c} className="flex items-center gap-1 rounded-full border py-1 pl-1 pr-2 text-xs">
                    <span className="h-5 w-5 rounded-full border" style={{ background: c }} />{c}
                    <button type="button" aria-label={`Remove ${c}`} onClick={() => form.setValue("colors", v.colors.filter((x) => x !== c))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
                {v.colors.length < 5 && (
                  <label className="flex cursor-pointer items-center gap-1 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:border-primary">
                    <Plus className="h-3 w-3" /> Add color
                    <input type="color" className="sr-only" onChange={(e) => { const c = e.target.value.toUpperCase(); if (!v.colors.includes(c)) form.setValue("colors", [...v.colors, c]) }} />
                  </label>)}
              </div>
            </div>
          </>)}

          {step === 4 && (<>
            <Dropzone onFiles={addFiles} label="Drag photos here or tap to choose" hint={`Images up to 10 MB · ${files.length}/${maxPhotos} added`} />
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {previews.map((src, i) => (
                  <div key={src} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={files[i].name} className="h-full w-full object-cover" />
                    <button type="button" aria-label="Remove photo" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"><X className="h-3 w-3" /></button>
                  </div>))}
              </div>)}
            <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes (optional)</FormLabel><FormControl><Textarea rows={4} placeholder="Quotes, words, or anything else I should know" {...field} /></FormControl><FormMessage /></FormItem>)} />
          </>)}

          {step === 5 && (
            <dl className="space-y-3 text-sm">
              {([
                ["Name", v.name], ["Email", v.email], ["Phone", v.phone || "—"], ["Region", v.region === "india" ? "India" : "Global"],
                ["Tier", `${v.tier} · ${PRICING[v.tier][v.region]}`], ["Print & Ship", v.printAddon ? `Yes (${PRICING.addon[v.region]})` : "No"],
                ["Style", v.style], ["Colors", v.colors.join(", ") || "—"], ["Photos", `${files.length} image(s)`], ["Notes", v.notes || "—"],
              ] as const).map(([k, val]) => (<div key={k} className="flex justify-between gap-4 border-b pb-2"><dt className="text-muted-foreground">{k}</dt><dd className="text-right capitalize">{val}</dd></div>))}
              {v.goals.map((g) => (<div key={g.category}><dt className="font-medium">{g.category}</dt><dd className="text-muted-foreground">{g.details}</dd></div>))}
            </dl>
          )}
        </CardContent></Card>

        <div className="flex justify-between">
          <Button type="button" variant="ghost" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}>Back</Button>
          {step < STEPS.length - 1
            ? <Button type="button" className="rounded-xl" onClick={next}>Continue</Button>
            : <Button type="submit" className="rounded-xl" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit order</Button>}
        </div>
      </form>
    </Form>
  )
}
