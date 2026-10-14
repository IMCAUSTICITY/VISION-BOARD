"use client"
import { Download } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export type SignedFile = { id: string; name: string; url: string; downloadUrl: string }
export function PhotoGrid({ files, isImage = true }: { files: SignedFile[]; isImage?: boolean }) {
  if (!files.length) return <p className="text-sm text-muted-foreground">Nothing here yet.</p>
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {files.map((f) => (
        <div key={f.id} className="space-y-1">
          <Dialog>
            {isImage ? (
              <>
                <DialogTrigger3 f={f} />
                <DialogContent className="max-w-3xl">
                  <DialogTitle className="truncate text-sm">{f.name}</DialogTitle>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.name} className="max-h-[75vh] w-full rounded-lg object-contain" />
                </DialogContent>
              </>
            ) : <p className="truncate text-sm">{f.name}</p>}
          </Dialog>
          <Button asChild variant="outline" size="sm" className="w-full rounded-lg"><a href={f.downloadUrl}><Download className="mr-1 h-3.5 w-3.5" />Download</a></Button>
        </div>
      ))}
    </div>
  )
}
import { DialogTrigger } from "@/components/ui/dialog"
function DialogTrigger3({ f }: { f: SignedFile }) {
  return (
    <DialogTrigger asChild>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.url} alt={f.name} className="aspect-square w-full cursor-zoom-in rounded-lg object-cover" />
    </DialogTrigger>
  )
}
