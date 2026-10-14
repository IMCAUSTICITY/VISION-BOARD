import { z } from "zod"
import { GOALS, STYLES } from "./constants"
export const orderSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  region: z.enum(["india", "global"]),
  tier: z.enum(["basic", "premium"]),
  printAddon: z.boolean(),
  goals: z.array(z.object({ category: z.enum(GOALS), details: z.string().min(5, "Tell me a little more about this goal") })).min(1, "Pick at least one goal"),
  style: z.enum(STYLES, { errorMap: () => ({ message: "Choose a style" }) }),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(5),
  notes: z.string().max(2000).optional(),
})
export type OrderValues = z.infer<typeof orderSchema>
