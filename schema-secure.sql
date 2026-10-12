-- OPTIONAL but recommended: make each visitor's portfolios private.
-- Run in Supabase > SQL Editor > New query > Run  (after schema.sql).
--
-- BEFORE running: Supabase > Authentication > Sign In / Providers > enable "Anonymous sign-ins".
-- Row Level Security stays ON. The website then signs each browser in anonymously and
-- the policies below let a visitor read / edit / delete ONLY the rows they created.
--
-- Note: rows created before this migration have no owner_id, so they stop showing up in the website
-- (they are NOT deleted). To keep one, set its owner_id to a user's id from Authentication > Users.

alter table public.portfolios
  add column if not exists owner_id uuid default auth.uid() references auth.users(id) on delete cascade;

create index if not exists portfolios_owner_idx on public.portfolios(owner_id);

drop policy if exists "public read"   on public.portfolios;
drop policy if exists "public insert" on public.portfolios;
drop policy if exists "public update" on public.portfolios;
drop policy if exists "public delete" on public.portfolios;

create policy "owner read"   on public.portfolios for select to authenticated using (owner_id = auth.uid());
create policy "owner insert" on public.portfolios for insert to authenticated with check (owner_id = auth.uid());
create policy "owner update" on public.portfolios for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner delete" on public.portfolios for delete to authenticated using (owner_id = auth.uid());
