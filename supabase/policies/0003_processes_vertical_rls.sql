alter table public.processes enable row level security;

drop policy if exists "tenant members can read processes" on public.processes;
create policy "tenant members can read processes"
on public.processes
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage processes" on public.processes;
create policy "tenant owners and admins can manage processes"
on public.processes
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = processes.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = processes.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
