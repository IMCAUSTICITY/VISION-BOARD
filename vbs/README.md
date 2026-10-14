# VisionBoard Studio (Phase 1)

Next.js App Router + Tailwind + shadcn/ui + Supabase (Postgres, Storage, Auth) + Resend.

## Setup
1. `npm install`
2. Add shadcn components (config is already in `components.json`):
   `npx shadcn@latest add button card form input textarea select checkbox badge table tabs dialog progress sonner label`
   (if `init` prompts about overwriting `globals.css`, keep this repo's version — it holds the #6B4EFF theme tokens)
3. Create a Supabase project, then run `supabase/schema.sql` in the SQL editor (tables, RLS, two private storage buckets).
4. Supabase > Authentication > Users: add the founder (email + password).
5. `cp .env.example .env.local` and fill in Supabase keys, `ADMIN_EMAILS`, `RESEND_API_KEY`, `EMAIL_FROM`.
6. `npm run dev`. Public: `/`, `/order`. Admin: `/admin/login`.

## How it fits together
- `middleware.ts` guards `/admin/*` (valid Supabase session AND email in `ADMIN_EMAILS`). Admin server actions re-check with `requireAdmin()`.
- Tables have RLS on with no policies: only server code using the service-role key touches data. The key never reaches the browser.
- Intake photos upload browser -> private `client-photos` bucket (anon insert only); the server action stores paths. Admin sees them through signed URLs. Final boards go to `final-boards` (authenticated only).
- Email: `lib/email.ts`. A failed email never blocks an order (logged only). Use a verified domain in Resend for real sends.

## Extending later (board builder)
`clients`, `orders`, `files` are separate. Add `board_templates`, `boards` (order_id), `board_elements` (board_id, file_id, x/y/w/h) as new tables; see the comment in `schema.sql`. No existing table needs to change.

## Known Phase 1 limits
Anyone can upload to the intake bucket (add rate limiting / Turnstile before heavy Instagram traffic). Dashboard counts are computed in JS, fine for thousands of orders.
