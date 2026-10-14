-- Run in Supabase SQL editor. clients / orders / files are separate entities so a future
-- board builder (templates, boards, board_elements) can reference orders and files without restructuring.
create extension if not exists pgcrypto;

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null unique, phone text,
  region text not null check (region in ('india','global')),
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001) unique,  -- shown as VB-1001
  client_id uuid not null references clients(id),
  tier text not null check (tier in ('basic','premium')),
  print_addon boolean not null default false,
  goals jsonb not null default '[]',          -- [{category, details}]
  style text, colors text[] not null default '{}', notes text,
  status text not null default 'new' check (status in ('new','in_progress','in_revision','delivered')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid')),
  founder_notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  kind text not null check (kind in ('client_photo','final_board')),
  bucket text not null, path text not null, filename text, size_bytes bigint,
  created_at timestamptz not null default now()
);
create index on orders (status, created_at desc);
create index on files (order_id);

-- FUTURE (not built in Phase 1): board_templates, boards (order_id, template_id), board_elements (board_id, file_id, x, y, w, h, z, props jsonb)

create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger orders_touch before update on orders for each row execute function touch_updated_at();

-- RLS on with NO table policies: only the server (service role key) can read/write tables.
alter table clients enable row level security;
alter table orders enable row level security;
alter table files enable row level security;

-- Storage: private buckets
insert into storage.buckets (id, name, public) values ('client-photos','client-photos',false), ('final-boards','final-boards',false) on conflict do nothing;
create policy "public can upload intake photos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'client-photos');
create policy "admin manages final boards" on storage.objects for all to authenticated using (bucket_id = 'final-boards') with check (bucket_id = 'final-boards');
