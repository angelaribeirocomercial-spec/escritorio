alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.memberships enable row level security;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = target_tenant_id
      and memberships.is_active = true
  );
$$;

create or replace function public.is_current_user(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select auth.uid() = target_user_id;
$$;

drop policy if exists "tenant members can read tenant" on public.tenants;
create policy "tenant members can read tenant"
on public.tenants
for select
to authenticated
using (public.is_tenant_member(id));

drop policy if exists "tenant owners and admins can update tenant" on public.tenants;
create policy "tenant owners and admins can update tenant"
on public.tenants
for update
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = tenants.id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = tenants.id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "users can read own profile" on public.profiles;
create policy "users can read own profile"
on public.profiles
for select
to authenticated
using (public.is_current_user(id));

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (public.is_current_user(id))
with check (public.is_current_user(id));

drop policy if exists "users can read own memberships" on public.memberships;
create policy "users can read own memberships"
on public.memberships
for select
to authenticated
using (public.is_current_user(user_id));

drop policy if exists "tenant admins can read all memberships for tenant" on public.memberships;
create policy "tenant admins can read all memberships for tenant"
on public.memberships
for select
to authenticated
using (
  exists (
    select 1
    from public.memberships actor_membership
    where actor_membership.user_id = auth.uid()
      and actor_membership.tenant_id = memberships.tenant_id
      and actor_membership.is_active = true
      and actor_membership.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant owners and admins can manage memberships" on public.memberships;
create policy "tenant owners and admins can manage memberships"
on public.memberships
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships actor_membership
    where actor_membership.user_id = auth.uid()
      and actor_membership.tenant_id = memberships.tenant_id
      and actor_membership.is_active = true
      and actor_membership.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships actor_membership
    where actor_membership.user_id = auth.uid()
      and actor_membership.tenant_id = memberships.tenant_id
      and actor_membership.is_active = true
      and actor_membership.role in ('owner', 'admin')
  )
);
