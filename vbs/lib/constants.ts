export const GOALS = ["Career", "Health", "Relationships", "Travel", "Finance", "Personal Growth"] as const
export const STYLES = ["Minimal", "Boho", "Bright & Bold", "Pastel", "Monochrome"] as const
export const STYLE_SWATCHES: Record<string, string[]> = {
  Minimal: ["#F4F1EC", "#D9D4CB", "#2B2B2B"], Boho: ["#C9A27E", "#A5573E", "#E8D9C4"],
  "Bright & Bold": ["#FF4D6D", "#FFC300", "#2D6CFF"], Pastel: ["#F7CAD0", "#CDE7F0", "#E2D6F5"],
  Monochrome: ["#111111", "#777777", "#EDEDED"],
}
export const STATUSES = [
  { value: "new", label: "New", cls: "bg-violet-100 text-violet-800" },
  { value: "in_progress", label: "In Progress", cls: "bg-amber-100 text-amber-800" },
  { value: "in_revision", label: "In Revision", cls: "bg-sky-100 text-sky-800" },
  { value: "delivered", label: "Delivered", cls: "bg-emerald-100 text-emerald-800" },
] as const
export const statusMeta = (v: string) => STATUSES.find((s) => s.value === v) ?? STATUSES[0]
export const PRICING = {
  basic: { india: "₹299–399", global: "$15–18" },
  premium: { india: "₹599–799", global: "$28–40" },
  addon: { india: "+₹250", global: "+$10" },
} as const
export const MAX_PHOTOS = { basic: 8, premium: 20 } as const
