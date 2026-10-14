import { Resend } from "resend"
export async function sendConfirmation(to: string, name: string, code: string, tier: string) {
  const resend = new Resend(process.env.RESEND_API_KEY) // placeholder key in .env until you add a real one
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "VisionBoard Studio <onboarding@resend.dev>", to,
    subject: `We got your order ${code}`,
    html: `<div style="font-family:sans-serif;max-width:480px"><h2 style="color:#6B4EFF">Thank you, ${name.replace(/</g, "")}!</h2>
      <p>Your <b>${tier}</b> vision board order <b>${code}</b> is in. I'll start designing soon and email you the first draft.</p>
      <p>Reply to this email if you want to add anything.</p></div>`,
  })
}
