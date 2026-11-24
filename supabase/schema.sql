-- Run this first in Supabase SQL Editor.
-- Visitors can insert a validated message, but no role can read messages yet.

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  email text not null check (
    char_length(btrim(email)) between 3 and 254
    and btrim(email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  project_type text not null check (project_type in (
    'Website design',
    'Branding & identity',
    'Social media design',
    'Creative concept'
  )),
  message text not null check (char_length(btrim(message)) between 1 and 10000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

revoke all on table public.messages from anon, authenticated;
grant insert (name, email, project_type, message)
  on table public.messages
  to anon, authenticated;

drop policy if exists "Public can submit messages" on public.messages;
create policy "Public can submit messages"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    char_length(btrim(name)) between 1 and 120
    and char_length(btrim(email)) between 3 and 254    and btrim(email) ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'    and project_type in (
      'Website design',
      'Branding & identity',
      'Social media design',
      'Creative concept'
    )
    and char_length(btrim(message)) between 1 and 10000
  );

-- Do not add a SELECT policy until the owner account exists.
-- RLS blocks reads by default when no SELECT policy matches.
