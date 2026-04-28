alter table public.contract_analyses enable row level security;

drop policy if exists "tenant members can read contract analyses" on public.contract_analyses;
create policy "tenant members can read contract analyses"
on public.contract_analyses
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage contract analyses" on public.contract_analyses;
create policy "tenant owners and admins can manage contract analyses"
on public.contract_analyses
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = contract_analyses.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = contract_analyses.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
