-- Run this in Supabase > SQL Editor > New query > Run

create table if not exists public.portfolios (
  id          text primary key,
  name        text not null,
  title       text,
  photo       text,
  email       text not null,
  phone       text,
  address     text,
  about       text,
  education   jsonb not null default '[]'::jsonb,
  skills      jsonb not null default '[]'::jsonb,
  projects    jsonb not null default '[]'::jsonb,
  experience  jsonb not null default '[]'::jsonb,
  links       jsonb not null default '[]'::jsonb,
  template    int  not null default 0 check (template between 0 and 2),
  updated_at  bigint not null default (extract(epoch from now())*1000)::bigint,
  created_at  timestamptz not null default now()
);

alter table public.portfolios enable row level security;

-- Class-project policies: anyone using the website can add / read / edit / delete.
create policy "public read"   on public.portfolios for select using (true);
create policy "public insert" on public.portfolios for insert with check (true);
create policy "public update" on public.portfolios for update using (true) with check (true);
create policy "public delete" on public.portfolios for delete using (true);
