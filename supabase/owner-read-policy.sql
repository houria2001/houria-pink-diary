-- Run only after creating the owner account in Supabase Authentication.
-- Replace the UUID below with that user's ID from Authentication > Users.
-- The UUID is an identifier, not a password or API secret.

grant select on table public.messages to authenticated;

drop policy if exists "Owner can read messages" on public.messages;
create policy "Owner can read messages"
  on public.messages
  for select
  to authenticated
  using ((select auth.uid()) = '5d370b4e-7508-4c12-ab98-1f1032887b73'::uuid);

-- There are intentionally no UPDATE or DELETE grants or policies.
