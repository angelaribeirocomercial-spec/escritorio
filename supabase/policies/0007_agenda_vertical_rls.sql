alter table public.agenda_commitments enable row level security;
alter table public.procedural_deadlines enable row level security;

drop policy if exists "tenant members can read agenda commitments" on public.agenda_commitments;
create policy "tenant members can read agenda commitments"
on public.agenda_commitments
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage agenda commitments" on public.agenda_commitments;
create policy "tenant owners and admins can manage agenda commitments"
on public.agenda_commitments
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = agenda_commitments.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = agenda_commitments.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read procedural deadlines" on public.procedural_deadlines;
create policy "tenant members can read procedural deadlines"
on public.procedural_deadlines
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage procedural deadlines" on public.procedural_deadlines;
create policy "tenant owners and admins can manage procedural deadlines"
on public.procedural_deadlines
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = procedural_deadlines.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = procedural_deadlines.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
