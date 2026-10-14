"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabaseBrowser } from "@/lib/supabase/client"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState(""), [password, setPassword] = useState("")
  const [error, setError] = useState(""), [busy, setBusy] = useState(false)
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("")
    const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password })
    if (error) { setError("That email or password didn't work."); setBusy(false); return }
    router.push("/admin"); router.refresh()
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm rounded-xl shadow-soft">
        <CardHeader><CardTitle className="text-2xl">Founder login</CardTitle></CardHeader>
        <CardContent><form onSubmit={submit} className="space-y-4">
          <Input type="email" placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button className="w-full rounded-xl" disabled={busy}>Sign in</Button>
        </form></CardContent>
      </Card>
    </main>
  )
}
