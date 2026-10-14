"use client"
import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

export function Dropzone({ onFiles, accept = "image/*", multiple = true, label, hint }: {
  onFiles: (f: File[]) => void; accept?: string; multiple?: boolean; label: string; hint?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)
  return (
    <div role="button" tabIndex={0}
      onClick={() => ref.current?.click()} onKeyDown={(e) => e.key === "Enter" && ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)) }}
      className={cn("flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-card px-4 py-8 text-center transition-colors",
        over ? "border-primary bg-accent" : "border-input hover:border-primary/60")}>
      <UploadCloud className="h-7 w-7 text-primary" />
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = "" }} />
    </div>
  )
}
