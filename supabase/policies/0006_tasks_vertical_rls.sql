alter table public.tasks enable row level security;

drop policy if exists "tenant members can read tasks" on public.tasks;
create policy "tenant members can read tasks"
on public.tasks
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage tasks" on public.tasks;
create policy "tenant owners and admins can manage tasks"
on public.tasks
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = tasks.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = tasks.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
