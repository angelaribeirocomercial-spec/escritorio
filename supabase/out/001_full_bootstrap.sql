-- AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
-- Run this in the Supabase SQL Editor to bootstrap the current project schema.

-- ===== MIGRATIONS =====

-- >>> supabase/migrations/0001_initial_identity_tenancy.sql
create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'trial' check (plan in ('trial', 'starter', 'pro')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'lawyer', 'assistant')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, tenant_id)
);

create index if not exists memberships_user_id_idx
  on public.memberships (user_id);

create index if not exists memberships_tenant_id_idx
  on public.memberships (tenant_id);

create index if not exists memberships_user_active_idx
  on public.memberships (user_id, is_active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists tenants_set_updated_at on public.tenants;
create trigger tenants_set_updated_at
before update on public.tenants
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists memberships_set_updated_at on public.memberships;
create trigger memberships_set_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- >>> supabase/migrations/0002_clients_vertical.sql
create table if not exists public.clients (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  full_name text not null,
  document_id text not null,
  email text not null,
  phone text not null,
  whatsapp text not null,
  address text not null,
  lead_source text not null,
  bank_name text not null,
  service_status text not null check (service_status in ('triage', 'active', 'waiting-docs', 'closed')),
  signed_contract boolean not null default false,
  legal_viability_score numeric(4, 1) not null default 0,
  fees_label text not null,
  documents_sent integer not null default 0,
  notes text not null default '',
  ia_context text not null default '',
  linked_cases jsonb not null default '[]'::jsonb,
  linked_documents jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists clients_tenant_id_idx
  on public.clients (tenant_id);

create index if not exists clients_tenant_status_idx
  on public.clients (tenant_id, service_status);

create index if not exists clients_tenant_name_idx
  on public.clients (tenant_id, full_name);

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
before update on public.clients
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0003_processes_vertical.sql
create table if not exists public.processes (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null,
  process_number text not null,
  tribunal text not null,
  court_district text not null,
  court_name text not null,
  procedural_phase text not null,
  status text not null check (status in ('monitoring', 'awaiting-filing', 'active', 'stayed', 'closed')),
  responsible_lawyer text not null,
  monitoring_mode text not null check (monitoring_mode in ('manual', 'oab', 'court')),
  latest_timeline jsonb not null default '[]'::jsonb,
  banking_case_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists processes_tenant_id_idx
  on public.processes (tenant_id);

create index if not exists processes_tenant_status_idx
  on public.processes (tenant_id, status);

create index if not exists processes_tenant_number_idx
  on public.processes (tenant_id, process_number);

create index if not exists processes_client_id_idx
  on public.processes (client_id);

drop trigger if exists processes_set_updated_at on public.processes;
create trigger processes_set_updated_at
before update on public.processes
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0004_cases_vertical.sql
create table if not exists public.cases (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  title text not null,
  bank_name text not null,
  process_number text not null,
  contract_number text not null,
  claim_type text not null,
  stage text not null,
  status text not null check (status in ('draft', 'active', 'awaiting-action', 'closed')),
  amount_in_dispute numeric(14, 2) not null default 0,
  estimated_value numeric(14, 2) not null default 0,
  main_thesis text not null,
  legal_risk text not null check (legal_risk in ('low', 'medium', 'high')),
  suggested_strategy text not null,
  owner_label text not null,
  niche text not null check (niche in ('revisional', 'fraude', 'busca-apreensao')),
  linked_documents jsonb not null default '[]'::jsonb,
  linked_tasks jsonb not null default '[]'::jsonb,
  linked_deadlines jsonb not null default '[]'::jsonb,
  lexia_insights jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists cases_tenant_id_idx
  on public.cases (tenant_id);

create index if not exists cases_client_id_idx
  on public.cases (client_id);

create index if not exists cases_tenant_status_idx
  on public.cases (tenant_id, status);

create index if not exists cases_tenant_process_number_idx
  on public.cases (tenant_id, process_number);

drop trigger if exists cases_set_updated_at on public.cases;
create trigger cases_set_updated_at
before update on public.cases
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0005_documents_vertical.sql
create table if not exists public.documents (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  file_name text not null,
  original_file_name text,
  document_type text not null,
  category text not null,
  tags jsonb not null default '[]'::jsonb,
  ai_status text not null check (ai_status in ('not_analyzed', 'analyzed', 'needs_review')),
  summary text not null default '',
  page_count integer not null default 0,
  uploaded_at date not null,
  preview_label text not null default '',
  storage_bucket text not null default '',
  storage_path text not null default '',
  storage_mime_type text not null default 'application/octet-stream',
  storage_size_bytes bigint not null default 0,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists documents_tenant_id_idx
  on public.documents (tenant_id);

create index if not exists documents_case_id_idx
  on public.documents (case_id);

create index if not exists documents_client_id_idx
  on public.documents (client_id);

create index if not exists documents_tenant_type_idx
  on public.documents (tenant_id, document_type);

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0006_tasks_vertical.sql
create table if not exists public.tasks (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_label text not null,
  due_date date not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null check (status in ('todo', 'in_progress', 'done')),
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  suggested_by_claim_type text not null default '',
  lexia_next_step text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_tenant_id_idx
  on public.tasks (tenant_id);

create index if not exists tasks_case_id_idx
  on public.tasks (case_id);

create index if not exists tasks_client_id_idx
  on public.tasks (client_id);

create index if not exists tasks_tenant_due_date_idx
  on public.tasks (tenant_id, due_date);

create index if not exists tasks_tenant_priority_idx
  on public.tasks (tenant_id, priority);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0007_agenda_vertical.sql
create table if not exists public.agenda_commitments (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text references public.clients (id) on delete cascade,
  case_id text references public.cases (id) on delete cascade,
  process_id text references public.processes (id) on delete cascade,
  title text not null,
  description text not null default '',
  scheduled_for timestamptz not null,
  responsible_label text not null,
  location_label text not null,
  category text not null check (category in ('hearing', 'client-follow-up', 'internal-review', 'meeting')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.procedural_deadlines (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  process_id text references public.processes (id) on delete cascade,
  title text not null,
  description text not null default '',
  due_date date not null,
  responsible_label text not null,
  source_label text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists agenda_commitments_tenant_id_idx
  on public.agenda_commitments (tenant_id);

create index if not exists agenda_commitments_tenant_scheduled_for_idx
  on public.agenda_commitments (tenant_id, scheduled_for);

create index if not exists procedural_deadlines_tenant_id_idx
  on public.procedural_deadlines (tenant_id);

create index if not exists procedural_deadlines_tenant_due_date_idx
  on public.procedural_deadlines (tenant_id, due_date);

drop trigger if exists agenda_commitments_set_updated_at on public.agenda_commitments;
create trigger agenda_commitments_set_updated_at
before update on public.agenda_commitments
for each row
execute function public.set_updated_at();

drop trigger if exists procedural_deadlines_set_updated_at on public.procedural_deadlines;
create trigger procedural_deadlines_set_updated_at
before update on public.procedural_deadlines
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0008_contract_analyses_vertical.sql
create table if not exists public.contract_analyses (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  document_id text not null references public.documents (id) on delete cascade,
  rate_label text not null,
  cet_label text not null,
  capitalization_label text not null,
  fees_label text not null,
  bundled_insurance_label text not null,
  permanence_commission_label text not null,
  penalty_label text not null,
  sensitive_clauses jsonb not null default '[]'::jsonb,
  abusiveness_signals jsonb not null default '[]'::jsonb,
  suggested_thesis text not null,
  procedural_risk text not null check (procedural_risk in ('low', 'medium', 'high')),
  suggested_requests jsonb not null default '[]'::jsonb,
  executive_summary text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists contract_analyses_tenant_id_idx
  on public.contract_analyses (tenant_id);

create index if not exists contract_analyses_document_id_idx
  on public.contract_analyses (document_id);

drop trigger if exists contract_analyses_set_updated_at on public.contract_analyses;
create trigger contract_analyses_set_updated_at
before update on public.contract_analyses
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0009_procedural_updates_vertical.sql
create table if not exists public.procedural_updates (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  process_id text not null references public.processes (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  occurred_at date not null,
  movement_type text not null,
  source_court text not null,
  source_label text not null,
  raw_movement text not null,
  operational_summary text not null,
  criticality text not null check (criticality in ('low', 'medium', 'high')),
  clara_impact_summary text not null,
  clara_caution text not null,
  clara_next_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists procedural_updates_tenant_id_idx
  on public.procedural_updates (tenant_id);

create index if not exists procedural_updates_tenant_occurred_at_idx
  on public.procedural_updates (tenant_id, occurred_at desc);

create index if not exists procedural_updates_process_id_idx
  on public.procedural_updates (process_id);

drop trigger if exists procedural_updates_set_updated_at on public.procedural_updates;
create trigger procedural_updates_set_updated_at
before update on public.procedural_updates
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0010_official_diary_vertical.sql
create table if not exists public.official_diary_publications (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  process_id text not null references public.processes (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  published_at date not null,
  source_court text not null,
  source_label text not null,
  title text not null,
  raw_context text not null,
  banking_summary text not null,
  required_action text not null,
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  responsible_lawyer text not null,
  suggested_task_title text not null,
  suggested_task_description text not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists official_diary_publications_tenant_id_idx
  on public.official_diary_publications (tenant_id);

create index if not exists official_diary_publications_tenant_published_at_idx
  on public.official_diary_publications (tenant_id, published_at desc);

create index if not exists official_diary_publications_process_id_idx
  on public.official_diary_publications (process_id);

drop trigger if exists official_diary_publications_set_updated_at on public.official_diary_publications;
create trigger official_diary_publications_set_updated_at
before update on public.official_diary_publications
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0011_financial_entries_vertical.sql
create table if not exists public.financial_entries (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text references public.clients (id) on delete set null,
  case_id text references public.cases (id) on delete set null,
  kind text not null check (kind in ('income', 'expense', 'transfer')),
  title text not null,
  description text not null default '',
  account_label text not null,
  counterparty_label text not null default '',
  amount numeric(12, 2) not null,
  due_date date not null,
  settled_at date,
  status text not null check (status in ('open', 'settled')),
  category_label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists financial_entries_tenant_id_idx
  on public.financial_entries (tenant_id);

create index if not exists financial_entries_tenant_kind_due_date_idx
  on public.financial_entries (tenant_id, kind, due_date);

drop trigger if exists financial_entries_set_updated_at on public.financial_entries;
create trigger financial_entries_set_updated_at
before update on public.financial_entries
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0012_adversaries_vertical.sql
create table if not exists public.adversaries (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  document_id text not null default '',
  bank_name text not null default '',
  case_summary text not null default '',
  attorney_label text not null default '',
  contact_label text not null default '',
  status text not null check (status in ('active', 'inactive')) default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists adversaries_tenant_id_idx
  on public.adversaries (tenant_id);

create index if not exists adversaries_tenant_name_idx
  on public.adversaries (tenant_id, name);

drop trigger if exists adversaries_set_updated_at on public.adversaries;
create trigger adversaries_set_updated_at
before update on public.adversaries
for each row
execute function public.set_updated_at();

-- >>> supabase/migrations/0013_document_storage_metadata.sql
insert into storage.buckets (id, name, public)
values ('tenant-documents', 'tenant-documents', false)
on conflict (id) do nothing;

alter table public.documents
  add column if not exists storage_bucket text not null default 'tenant-documents',
  add column if not exists storage_path text not null default '',
  add column if not exists storage_mime_type text not null default 'application/octet-stream',
  add column if not exists storage_size_bytes bigint not null default 0;

create index if not exists documents_tenant_storage_idx
  on public.documents (tenant_id, storage_bucket, storage_path);

drop policy if exists "tenant members can read document files" on storage.objects;
create policy "tenant members can read document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
  )
);

drop policy if exists "tenant owners and admins can manage document files" on storage.objects;
create policy "tenant owners and admins can manage document files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  bucket_id = 'tenant-documents'
  and exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id::text = split_part(storage.objects.name, '/', 1)
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- ===== POLICIES =====

-- >>> supabase/policies/0001_identity_tenancy_rls.sql
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

-- >>> supabase/policies/0002_clients_vertical_rls.sql
alter table public.clients enable row level security;

drop policy if exists "tenant members can read clients" on public.clients;
create policy "tenant members can read clients"
on public.clients
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage clients" on public.clients;
create policy "tenant owners and admins can manage clients"
on public.clients
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clients.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clients.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0003_processes_vertical_rls.sql
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

-- >>> supabase/policies/0004_cases_vertical_rls.sql
alter table public.cases enable row level security;

drop policy if exists "tenant members can read cases" on public.cases;
create policy "tenant members can read cases"
on public.cases
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage cases" on public.cases;
create policy "tenant owners and admins can manage cases"
on public.cases
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = cases.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = cases.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0005_documents_vertical_rls.sql
alter table public.documents enable row level security;

drop policy if exists "tenant members can read documents" on public.documents;
create policy "tenant members can read documents"
on public.documents
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage documents" on public.documents;
create policy "tenant owners and admins can manage documents"
on public.documents
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = documents.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = documents.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0006_tasks_vertical_rls.sql
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

-- >>> supabase/policies/0007_agenda_vertical_rls.sql
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

-- >>> supabase/policies/0008_contract_analyses_vertical_rls.sql
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

-- >>> supabase/policies/0009_procedural_updates_vertical_rls.sql
alter table public.procedural_updates enable row level security;

drop policy if exists "tenant members can read procedural updates" on public.procedural_updates;
create policy "tenant members can read procedural updates"
on public.procedural_updates
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage procedural updates" on public.procedural_updates;
create policy "tenant owners and admins can manage procedural updates"
on public.procedural_updates
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = procedural_updates.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = procedural_updates.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0010_official_diary_vertical_rls.sql
alter table public.official_diary_publications enable row level security;

drop policy if exists "tenant members can read official diary publications" on public.official_diary_publications;
create policy "tenant members can read official diary publications"
on public.official_diary_publications
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage official diary publications" on public.official_diary_publications;
create policy "tenant owners and admins can manage official diary publications"
on public.official_diary_publications
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = official_diary_publications.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = official_diary_publications.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0011_financial_entries_vertical_rls.sql
alter table public.financial_entries enable row level security;

drop policy if exists "tenant members can read financial entries" on public.financial_entries;
create policy "tenant members can read financial entries"
on public.financial_entries
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage financial entries" on public.financial_entries;
create policy "tenant owners and admins can manage financial entries"
on public.financial_entries
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = financial_entries.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = financial_entries.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- >>> supabase/policies/0012_adversaries_vertical_rls.sql
alter table public.adversaries enable row level security;

drop policy if exists "tenant members can read adversaries" on public.adversaries;
create policy "tenant members can read adversaries"
on public.adversaries
for select
to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists "tenant owners and admins can manage adversaries" on public.adversaries;
create policy "tenant owners and admins can manage adversaries"
on public.adversaries
for all
to authenticated
using (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = adversaries.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = adversaries.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

-- ===== SEEDS =====

-- >>> supabase/seeds/0001_identity_tenancy_seed.sql
do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_tenant_id uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    demo_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@lexia-demo.local',
    crypt('ChangeMe123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"LexIA Demo Owner"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update
    set email = excluded.email,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = timezone('utc', now());

  insert into public.tenants (id, name, slug, plan)
  values (
    demo_tenant_id,
    'LexIA Bancaria Demo',
    'lexia-demo',
    'pro'
  )
  on conflict (id) do update
    set name = excluded.name,
        slug = excluded.slug,
        plan = excluded.plan,
        updated_at = timezone('utc', now());

  insert into public.profiles (id, full_name, email, is_active)
  values (
    demo_user_id,
    'LexIA Demo Owner',
    'owner@lexia-demo.local',
    true
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        is_active = excluded.is_active,
        updated_at = timezone('utc', now());

  insert into public.memberships (id, user_id, tenant_id, role, is_active)
  values (
    '22222222-2222-2222-2222-222222222222',
    demo_user_id,
    demo_tenant_id,
    'owner',
    true
  )
  on conflict (id) do update
    set user_id = excluded.user_id,
        tenant_id = excluded.tenant_id,
        role = excluded.role,
        is_active = excluded.is_active,
        updated_at = timezone('utc', now());
end
$$;

-- >>> supabase/seeds/0002_clients_vertical_seed.sql
insert into public.clients (
  id,
  tenant_id,
  full_name,
  document_id,
  email,
  phone,
  whatsapp,
  address,
  lead_source,
  bank_name,
  service_status,
  signed_contract,
  legal_viability_score,
  fees_label,
  documents_sent,
  notes,
  ia_context,
  linked_cases,
  linked_documents,
  timeline
)
values
  (
    'cl-001',
    '11111111-1111-1111-1111-111111111111',
    'Mariana Torres Lima',
    '284.115.990-41',
    'mariana.torres@cliente.com.br',
    '(11) 98421-1190',
    '(11) 98421-1190',
    'Rua Alvorada, 182, Vila Olimpia, Sao Paulo/SP',
    'Instagram',
    'Banco Pan',
    'active',
    true,
    9.1,
    'R$ 8.500 + 20% sobre exito',
    12,
    'Cliente relata contratacao por correspondente sem explicacao adequada sobre CET e seguro embutido.',
    'LexIA identificou sinais de venda casada e alta aderencia a tese revisional com pedido de repeticao de indebito.',
    '[{"id":"case-101","title":"Revisional de financiamento de veiculo","status":"Em analise inicial","thesis":"Juros abusivos e seguro embutido"}]'::jsonb,
    '["Contrato bancario","Planilha de parcelas","Extratos","Comprovante de renda"]'::jsonb,
    '["Lead qualificado via Instagram com score inicial 8.8","Contrato e documentos recebidos","Triagem da LexIA concluida com risco processual medio-baixo"]'::jsonb
  ),
  (
    'cl-002',
    '11111111-1111-1111-1111-111111111111',
    'Carlos Henrique Duarte',
    '317.558.120-08',
    'carlos.duarte@cliente.com.br',
    '(21) 98810-4422',
    '(21) 98810-4422',
    'Av. das Americas, 9600, Barra da Tijuca, Rio de Janeiro/RJ',
    'Indicacao',
    'Itau',
    'waiting-docs',
    false,
    7.4,
    'Proposta em aprovacao',
    5,
    'Possivel fraude bancaria por PIX. Falta boletim de ocorrencia e comprovantes complementares.',
    'LexIA recomenda reforcar checklist documental e validar cronologia das transferencias antes da definicao final da tese.',
    '[{"id":"case-205","title":"Fraude bancaria via PIX","status":"Aguardando documentos","thesis":"Falha de seguranca e dano moral"}]'::jsonb,
    '["Comprovantes PIX","Atendimento bancario","Capturas de tela"]'::jsonb,
    '["Cliente entrou por indicacao de ex-cliente","Atendimento inicial realizado pelo time comercial-juridico","Checklist de documentos enviado pelo escritorio"]'::jsonb
  ),
  (
    'cl-003',
    '11111111-1111-1111-1111-111111111111',
    'Patricia Gomes Araujo',
    '44.118.225/0001-10',
    'financeiro@araujologistica.com.br',
    '(31) 3339-7788',
    '(31) 99655-1199',
    'Rua Paraiba, 455, Funcionarios, Belo Horizonte/MG',
    'Google Ads',
    'Santander',
    'active',
    true,
    8.6,
    'R$ 14.000 + exito escalonado',
    18,
    'Empresa com contrato de capital de giro e discussao sobre encargos excessivos e capitalizacao mensal.',
    'LexIA aponta boa aderencia para revisional com estrategia combinada de revisao contratual e pedido de tutela para suspensao de negativacao.',
    '[{"id":"case-311","title":"Capital de giro com juros abusivos","status":"Peca inicial em preparacao","thesis":"Capitalizacao mensal indevida"},{"id":"case-312","title":"Negativacao indevida vinculada ao contrato","status":"Documentacao completa","thesis":"Suspensao de cobranca e danos"}]'::jsonb,
    '["CCB","Extratos da conta","Email de cobranca","Comprovantes bancarios","Contrato social"]'::jsonb,
    '["Lead convertido por campanha de alta intencao","Contrato assinado no mesmo dia da proposta","Time recebeu documentacao complementar da empresa"]'::jsonb
  )
on conflict (id) do update
set
  full_name = excluded.full_name,
  document_id = excluded.document_id,
  email = excluded.email,
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  address = excluded.address,
  lead_source = excluded.lead_source,
  bank_name = excluded.bank_name,
  service_status = excluded.service_status,
  signed_contract = excluded.signed_contract,
  legal_viability_score = excluded.legal_viability_score,
  fees_label = excluded.fees_label,
  documents_sent = excluded.documents_sent,
  notes = excluded.notes,
  ia_context = excluded.ia_context,
  linked_cases = excluded.linked_cases,
  linked_documents = excluded.linked_documents,
  timeline = excluded.timeline,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0003_processes_vertical_seed.sql
insert into public.processes (
  id,
  tenant_id,
  client_id,
  case_id,
  process_number,
  tribunal,
  court_district,
  court_name,
  procedural_phase,
  status,
  responsible_lawyer,
  monitoring_mode,
  latest_timeline,
  banking_case_snapshot
)
values
  (
    'proc-101',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    '1008421-19.2026.8.26.0100',
    'TJSP',
    'Sao Paulo/SP',
    '12a Vara Civel do Foro Central',
    'Tutela e citacao inicial',
    'active',
    'Dra. Helena Siqueira',
    'court',
    '[
      {"id":"proc-101-t1","occurredAt":"2026-04-02","title":"Distribuicao da acao","description":"Peticao inicial distribuida com pedido de revisao contratual e tutela para limitar cobranca.","source":"TJSP","criticality":"medium"},
      {"id":"proc-101-t2","occurredAt":"2026-04-05","title":"Conclusos para apreciacao da tutela","description":"Magistrado recebeu os autos para analise do pedido liminar.","source":"TJSP","criticality":"high"},
      {"id":"proc-101-t3","occurredAt":"2026-04-08","title":"Intimacao para complementar planilha","description":"Secretaria solicitou reforco da memoria de calculo contratual.","source":"TJSP","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-101","clientId":"cl-001","title":"Revisional de financiamento de veiculo","bankName":"Banco Pan","processNumber":"1008421-19.2026.8.26.0100","contractNumber":"PAN-44-99281","claimType":"acao_revisional","stage":"Analise inicial","status":"active","amountInDispute":68400,"estimatedValue":32200,"mainThesis":"Juros abusivos e seguro embutido","legalRisk":"medium","suggestedStrategy":"Consolidar memoria de calculo, destacar venda casada e estruturar pedido de revisao contratual com tutela para suspensao de cobranca excessiva.","ownerLabel":"Dra. Helena Siqueira","niche":"revisional","linkedDocuments":["Contrato bancario","Planilha de parcelas","Extratos","Comprovante de renda"],"linkedTasks":["Revisar memoria de calculo","Validar clausula de seguro embutido","Preparar peticao inicial"],"linkedDeadlines":["Coletar documentos complementares ate 14/04/2026","Aprovar estrategia interna ate 16/04/2026"],"lexiaInsights":["Boa aderencia a tese revisional com foco em venda casada.","Ha espaco para pedido cumulativo de repeticao de indebito.","Cliente tem documentacao suficiente para primeira peca."]}'::jsonb
  ),
  (
    'proc-205',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    '5011274-65.2026.8.19.0001',
    'TJRJ',
    'Rio de Janeiro/RJ',
    '7o Juizado Especial Civel da Capital',
    'Pre-protocolo estrategico',
    'awaiting-filing',
    'Dr. Caio Nascimento',
    'manual',
    '[
      {"id":"proc-205-t1","occurredAt":"2026-04-01","title":"Checklist probatorio iniciado","description":"Equipe iniciou consolidacao dos comprovantes PIX e historico de atendimento bancario.","source":"ADVX","criticality":"medium"},
      {"id":"proc-205-t2","occurredAt":"2026-04-06","title":"Boletim de ocorrencia pendente","description":"Sem o B.O., a estrategia segue aguardando validacao documental final.","source":"ADVX","criticality":"high"},
      {"id":"proc-205-t3","occurredAt":"2026-04-09","title":"Rascunho inicial liberado","description":"Estrutura de fatos e dano moral preparada para protocolo assim que a prova faltante entrar.","source":"ADVX","criticality":"low"}
    ]'::jsonb,
    '{"id":"case-205","clientId":"cl-002","title":"Fraude bancaria via PIX","bankName":"Itau","processNumber":"5011274-65.2026.8.19.0001","contractNumber":"PIX-FRD-1180","claimType":"fraude_bancaria","stage":"Aguardando documentos","status":"awaiting-action","amountInDispute":18750,"estimatedValue":41000,"mainThesis":"Falha de seguranca e dano moral","legalRisk":"medium","suggestedStrategy":"Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.","ownerLabel":"Dr. Caio Nascimento","niche":"fraude","linkedDocuments":["Comprovantes PIX","Atendimento bancario","Capturas de tela"],"linkedTasks":["Cobrar boletim de ocorrencia","Solicitar comprovante bancario detalhado","Montar cronologia do golpe"],"linkedDeadlines":["Revisar pendencias documentais em 11/04/2026"],"lexiaInsights":["Sem boletim de ocorrencia, a narrativa probatoria fica fragil.","A tese principal permanece viavel se a cronologia for bem consolidada."]}'::jsonb
  ),
  (
    'proc-311',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    '7012844-11.2026.8.13.0024',
    'TJMG',
    'Belo Horizonte/MG',
    '4a Vara Empresarial e Civel',
    'Inicial em revisao final',
    'monitoring',
    'Dra. Julia Ramalho',
    'oab',
    '[
      {"id":"proc-311-t1","occurredAt":"2026-03-29","title":"Leitura economica consolidada","description":"Planilha de encargos validada com foco em capitalizacao mensal e CET.","source":"ADVX","criticality":"medium"},
      {"id":"proc-311-t2","occurredAt":"2026-04-04","title":"Minuta encaminhada para revisao interna","description":"Peca inicial foi encaminhada para revisao da tese economica principal.","source":"ADVX","criticality":"low"},
      {"id":"proc-311-t3","occurredAt":"2026-04-09","title":"Janela de protocolo aberta","description":"Caso pronto para ingresso apos ultima checagem de anexos empresariais.","source":"ADVX","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-311","clientId":"cl-003","title":"Capital de giro com juros abusivos","bankName":"Santander","processNumber":"7012844-11.2026.8.13.0024","contractNumber":"CCB-88372","claimType":"juros_abusivos","stage":"Peca inicial em preparacao","status":"active","amountInDispute":248000,"estimatedValue":118000,"mainThesis":"Capitalizacao mensal indevida","legalRisk":"low","suggestedStrategy":"Combinar revisao contratual com pedido de tutela para limitar cobranca e reforcar a leitura economica do capital de giro.","ownerLabel":"Dra. Julia Ramalho","niche":"revisional","linkedDocuments":["CCB","Extratos da conta","Email de cobranca","Comprovantes bancarios","Contrato social"],"linkedTasks":["Finalizar fatos resumidos","Conferir planilha de encargos","Revisar fundamentos da inicial"],"linkedDeadlines":["Submeter minuta para revisao em 15/04/2026","Validar anexos ate 17/04/2026"],"lexiaInsights":["Caso com boa combinacao entre tese economica e prova documental.","Recomendavel destacar capitalizacao mensal e CET total no resumo executivo."]}'::jsonb
  ),
  (
    'proc-312',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    '7012855-49.2026.8.13.0024',
    'TJMG',
    'Belo Horizonte/MG',
    '3a Vara Civel de Belo Horizonte',
    'Suspensao da negativacao',
    'stayed',
    'Dra. Julia Ramalho',
    'court',
    '[
      {"id":"proc-312-t1","occurredAt":"2026-03-27","title":"Tutela parcialmente apreciada","description":"Juizo indicou necessidade de complemento da prova de restricao indevida.","source":"TJMG","criticality":"high"},
      {"id":"proc-312-t2","occurredAt":"2026-04-03","title":"Autos em carga para manifestacao","description":"Equipe separou comprovantes de negativacao e cobrancas correlatas.","source":"TJMG","criticality":"medium"},
      {"id":"proc-312-t3","occurredAt":"2026-04-07","title":"Processo temporariamente suspenso","description":"Fluxo parado ate juntada de documento complementar exigido pelo juizo.","source":"TJMG","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-312","clientId":"cl-003","title":"Negativacao indevida vinculada ao contrato","bankName":"Santander","processNumber":"7012855-49.2026.8.13.0024","contractNumber":"NEG-55210","claimType":"negativacao_indevida","stage":"Documentacao completa","status":"active","amountInDispute":32000,"estimatedValue":24000,"mainThesis":"Suspensao de cobranca e danos","legalRisk":"low","suggestedStrategy":"Estruturar urgencia na retirada da restricao e combinar pedido declaratorio com danos morais bancarios.","ownerLabel":"Dra. Julia Ramalho","niche":"revisional","linkedDocuments":["Email de cobranca","Comprovantes bancarios","Notificacao de negativacao"],"linkedTasks":["Validar prova da negativacao","Fechar pedido de tutela","Revisar danos morais"],"linkedDeadlines":["Consolidar anexos ate 13/04/2026"],"lexiaInsights":["Caso apto para narrativa objetiva com pedido urgente.","Documentacao completa melhora o potencial de tutela."]}'::jsonb
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_number = excluded.process_number,
  tribunal = excluded.tribunal,
  court_district = excluded.court_district,
  court_name = excluded.court_name,
  procedural_phase = excluded.procedural_phase,
  status = excluded.status,
  responsible_lawyer = excluded.responsible_lawyer,
  monitoring_mode = excluded.monitoring_mode,
  latest_timeline = excluded.latest_timeline,
  banking_case_snapshot = excluded.banking_case_snapshot,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0004_cases_vertical_seed.sql
insert into public.cases (
  id,
  tenant_id,
  client_id,
  title,
  bank_name,
  process_number,
  contract_number,
  claim_type,
  stage,
  status,
  amount_in_dispute,
  estimated_value,
  main_thesis,
  legal_risk,
  suggested_strategy,
  owner_label,
  niche,
  linked_documents,
  linked_tasks,
  linked_deadlines,
  lexia_insights
)
values
  (
    'case-101',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'Revisional de financiamento de veiculo',
    'Banco Pan',
    '1008421-19.2026.8.26.0100',
    'PAN-44-99281',
    'acao_revisional',
    'Analise inicial',
    'active',
    68400,
    32200,
    'Juros abusivos e seguro embutido',
    'medium',
    'Consolidar memoria de calculo, destacar venda casada e estruturar pedido de revisao contratual com tutela para suspensao de cobranca excessiva.',
    'Dra. Helena Siqueira',
    'revisional',
    '["Contrato bancario","Planilha de parcelas","Extratos","Comprovante de renda"]'::jsonb,
    '["Revisar memoria de calculo","Validar clausula de seguro embutido","Preparar peticao inicial"]'::jsonb,
    '["Coletar documentos complementares ate 14/04/2026","Aprovar estrategia interna ate 16/04/2026"]'::jsonb,
    '["Boa aderencia a tese revisional com foco em venda casada.","Ha espaco para pedido cumulativo de repeticao de indebito.","Cliente tem documentacao suficiente para primeira peca."]'::jsonb
  ),
  (
    'case-205',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'Fraude bancaria via PIX',
    'Itau',
    '5011274-65.2026.8.19.0001',
    'PIX-FRD-1180',
    'fraude_bancaria',
    'Aguardando documentos',
    'awaiting-action',
    18750,
    41000,
    'Falha de seguranca e dano moral',
    'medium',
    'Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.',
    'Dr. Caio Nascimento',
    'fraude',
    '["Comprovantes PIX","Atendimento bancario","Capturas de tela"]'::jsonb,
    '["Cobrar boletim de ocorrencia","Solicitar comprovante bancario detalhado","Montar cronologia do golpe"]'::jsonb,
    '["Revisar pendencias documentais em 11/04/2026"]'::jsonb,
    '["Sem boletim de ocorrencia, a narrativa probatoria fica fragil.","A tese principal permanece viavel se a cronologia for bem consolidada."]'::jsonb
  ),
  (
    'case-311',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'Capital de giro com juros abusivos',
    'Santander',
    '7012844-11.2026.8.13.0024',
    'CCB-88372',
    'juros_abusivos',
    'Peca inicial em preparacao',
    'active',
    248000,
    118000,
    'Capitalizacao mensal indevida',
    'low',
    'Combinar revisao contratual com pedido de tutela para limitar cobranca e reforcar a leitura economica do capital de giro.',
    'Dra. Julia Ramalho',
    'revisional',
    '["CCB","Extratos da conta","Email de cobranca","Comprovantes bancarios","Contrato social"]'::jsonb,
    '["Finalizar fatos resumidos","Conferir planilha de encargos","Revisar fundamentos da inicial"]'::jsonb,
    '["Submeter minuta para revisao em 15/04/2026","Validar anexos ate 17/04/2026"]'::jsonb,
    '["Caso com boa combinacao entre tese economica e prova documental.","Recomendavel destacar capitalizacao mensal e CET total no resumo executivo."]'::jsonb
  ),
  (
    'case-312',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'Negativacao indevida vinculada ao contrato',
    'Santander',
    '7012855-49.2026.8.13.0024',
    'NEG-55210',
    'negativacao_indevida',
    'Documentacao completa',
    'active',
    32000,
    24000,
    'Suspensao de cobranca e danos',
    'low',
    'Estruturar urgencia na retirada da restricao e combinar pedido declaratorio com danos morais bancarios.',
    'Dra. Julia Ramalho',
    'revisional',
    '["Email de cobranca","Comprovantes bancarios","Notificacao de negativacao"]'::jsonb,
    '["Validar prova da negativacao","Fechar pedido de tutela","Revisar danos morais"]'::jsonb,
    '["Consolidar anexos ate 13/04/2026"]'::jsonb,
    '["Caso apto para narrativa objetiva com pedido urgente.","Documentacao completa melhora o potencial de tutela."]'::jsonb
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  title = excluded.title,
  bank_name = excluded.bank_name,
  process_number = excluded.process_number,
  contract_number = excluded.contract_number,
  claim_type = excluded.claim_type,
  stage = excluded.stage,
  status = excluded.status,
  amount_in_dispute = excluded.amount_in_dispute,
  estimated_value = excluded.estimated_value,
  main_thesis = excluded.main_thesis,
  legal_risk = excluded.legal_risk,
  suggested_strategy = excluded.suggested_strategy,
  owner_label = excluded.owner_label,
  niche = excluded.niche,
  linked_documents = excluded.linked_documents,
  linked_tasks = excluded.linked_tasks,
  linked_deadlines = excluded.linked_deadlines,
  lexia_insights = excluded.lexia_insights,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0005_documents_vertical_seed.sql
insert into public.documents (
  id,
  tenant_id,
  client_id,
  case_id,
  file_name,
  original_file_name,
  document_type,
  category,
  tags,
  ai_status,
  summary,
  page_count,
  uploaded_at,
  preview_label,
  actions
)
values
  (
    'doc-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'contrato-financiamento-veiculo-mariana.pdf',
    'contrato-financiamento-veiculo-mariana.pdf',
    'Contrato bancario',
    'contrato',
    '["revisional","seguro","CET"]'::jsonb,
    'analyzed',
    'Contrato com indicios de seguro embutido e clausulas com impacto no CET total.',
    18,
    '2026-04-02',
    'Preview pendente do contrato com clausulas destacadas.',
    '["Analisar com IA","Resumir","Extrair tese","Gerar peca","Buscar jurisprudencia"]'::jsonb
  ),
  (
    'doc-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'planilha-parcelas-mariana.xlsx',
    'planilha-parcelas-mariana.xlsx',
    'Planilha',
    'financeiro',
    '["parcelas","juros","memoria-calculo"]'::jsonb,
    'needs_review',
    'Planilha utilizada para comparar parcelas contratadas e encargos efetivamente pagos.',
    4,
    '2026-04-03',
    'Preview pendente da memoria de calculo e das parcelas.',
    '["Analisar com IA","Resumir","Extrair tese"]'::jsonb
  ),
  (
    'doc-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    'comprovantes-pix-carlos.pdf',
    'comprovantes-pix-carlos.pdf',
    'Comprovante bancario',
    'fraude',
    '["pix","fraude","comprovantes"]'::jsonb,
    'analyzed',
    'Comprovantes das transferencias e registros de movimentacao vinculados ao golpe via PIX.',
    9,
    '2026-04-04',
    'Preview pendente dos comprovantes e da cronologia do evento.',
    '["Analisar com IA","Resumir","Buscar jurisprudencia"]'::jsonb
  ),
  (
    'doc-004',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'ccb-capital-giro-araujo.pdf',
    'ccb-capital-giro-araujo.pdf',
    'CCB',
    'contrato',
    '["capital-giro","ccb","capitalizacao"]'::jsonb,
    'analyzed',
    'Cedula de credito bancario com pontos sensiveis sobre capitalizacao mensal e encargos remuneratorios.',
    22,
    '2026-04-01',
    'Preview pendente da CCB com clausulas sensiveis destacadas.',
    '["Analisar com IA","Resumir","Extrair tese","Gerar peca","Buscar jurisprudencia"]'::jsonb
  ),
  (
    'doc-005',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    'notificacao-negativacao-araujo.pdf',
    'notificacao-negativacao-araujo.pdf',
    'Intimacao',
    'cobranca',
    '["negativacao","urgencia","cobranca"]'::jsonb,
    'not_analyzed',
    'Notificacao de negativacao vinculada ao contrato principal com potencial para pedido urgente.',
    3,
    '2026-04-05',
    'Preview pendente da notificacao de negativacao.',
    '["Analisar com IA","Resumir","Gerar peca"]'::jsonb
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  file_name = excluded.file_name,
  original_file_name = excluded.original_file_name,
  document_type = excluded.document_type,
  category = excluded.category,
  tags = excluded.tags,
  ai_status = excluded.ai_status,
  summary = excluded.summary,
  page_count = excluded.page_count,
  uploaded_at = excluded.uploaded_at,
  preview_label = excluded.preview_label,
  actions = excluded.actions,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0006_tasks_vertical_seed.sql
insert into public.tasks (
  id,
  tenant_id,
  client_id,
  case_id,
  title,
  description,
  assignee_label,
  due_date,
  priority,
  status,
  notes,
  checklist,
  suggested_by_claim_type,
  lexia_next_step
)
values
  (
    'task-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'Conferir memoria de calculo revisional',
    'Validar divergencia entre CET contratado, parcelas efetivas e seguro embutido antes da peca inicial.',
    'Dra. Helena Siqueira',
    '2026-04-11',
    'urgent',
    'in_progress',
    'Necessario fechar memoria com base na planilha e destacar venda casada no resumo executivo.',
    '[
      {"id":"task-001-1","label":"Conferir documentos","done":true},
      {"id":"task-001-2","label":"Solicitar contrato completo","done":true},
      {"id":"task-001-3","label":"Analisar abusividades","done":true},
      {"id":"task-001-4","label":"Definir tese","done":false},
      {"id":"task-001-5","label":"Gerar peticao inicial","done":false}
    ]'::jsonb,
    'Checklist sugerido para acao revisional.',
    'Fechar a comparacao entre parcelas e CET para sustentar a tese de juros abusivos com seguro embutido.'
  ),
  (
    'task-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    'Cobrar boletim de ocorrencia do cliente',
    'Formalizar a pendencia documental indispensavel para robustecer a tese de fraude bancaria via PIX.',
    'Dr. Caio Nascimento',
    '2026-04-10',
    'high',
    'todo',
    'Sem o boletim, a narrativa de seguranca e responsabilidade do banco perde forca probatoria.',
    '[
      {"id":"task-002-1","label":"Listar documentos faltantes","done":true},
      {"id":"task-002-2","label":"Enviar checklist ao cliente","done":true},
      {"id":"task-002-3","label":"Receber boletim de ocorrencia","done":false},
      {"id":"task-002-4","label":"Atualizar cronologia do golpe","done":false}
    ]'::jsonb,
    'Checklist sugerido para fraude bancaria PIX.',
    'Assim que o boletim entrar, consolidar cronologia e revisar pedido de dano moral.'
  ),
  (
    'task-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'Revisar fundamentos da inicial de capital de giro',
    'Revisao final dos fundamentos sobre capitalizacao mensal, CET e encargos remuneratorios.',
    'Dra. Julia Ramalho',
    '2026-04-15',
    'medium',
    'in_progress',
    'A peca esta bem encaminhada; falta amarrar com mais clareza o pedido de tutela para limitacao de cobranca.',
    '[
      {"id":"task-003-1","label":"Finalizar fatos resumidos","done":true},
      {"id":"task-003-2","label":"Conferir planilha de encargos","done":true},
      {"id":"task-003-3","label":"Revisar fundamentos da inicial","done":false},
      {"id":"task-003-4","label":"Submeter minuta para revisao","done":false}
    ]'::jsonb,
    'Checklist sugerido para juros abusivos em CCB.',
    'Enfatizar capitalizacao mensal e pedido de limitacao de cobranca no topico de urgencia.'
  ),
  (
    'task-004',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    'Fechar pedido de tutela para retirada da negativacao',
    'Consolidar os argumentos de urgencia e a prova da restricao crediticia indevida.',
    'Dra. Julia Ramalho',
    '2026-04-12',
    'urgent',
    'todo',
    'Caso apto para narrativa enxuta, com foco em urgencia e impacto operacional na empresa cliente.',
    '[
      {"id":"task-004-1","label":"Validar prova da negativacao","done":true},
      {"id":"task-004-2","label":"Fechar pedido de tutela","done":false},
      {"id":"task-004-3","label":"Revisar danos morais","done":false}
    ]'::jsonb,
    'Checklist sugerido para negativacao indevida.',
    'Priorizar o pedido liminar e anexar prova objetiva do impacto comercial da restricao.'
  ),
  (
    'task-005',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'Atualizar cliente sobre estrategia revisional',
    'Enviar resumo claro com status do caso, documentos utilizados e proximos passos da peca inicial.',
    'Time de Atendimento',
    '2026-04-13',
    'low',
    'done',
    'Atualizacao deve reforcar seguranca do cliente e alinhar expectativa sobre o tempo de ajuizamento.',
    '[
      {"id":"task-005-1","label":"Consolidar status interno","done":true},
      {"id":"task-005-2","label":"Montar resumo ao cliente","done":true},
      {"id":"task-005-3","label":"Registrar envio no historico","done":true}
    ]'::jsonb,
    'Checklist sugerido para atualizacao de cliente em revisional.',
    'Usar linguagem objetiva e reforcar que a estrategia esta baseada em seguro embutido e CET elevado.'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  title = excluded.title,
  description = excluded.description,
  assignee_label = excluded.assignee_label,
  due_date = excluded.due_date,
  priority = excluded.priority,
  status = excluded.status,
  notes = excluded.notes,
  checklist = excluded.checklist,
  suggested_by_claim_type = excluded.suggested_by_claim_type,
  lexia_next_step = excluded.lexia_next_step,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0007_agenda_vertical_seed.sql
insert into public.agenda_commitments (
  id,
  tenant_id,
  client_id,
  case_id,
  process_id,
  title,
  description,
  scheduled_for,
  responsible_label,
  location_label,
  category
)
values
  (
    'commitment-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'proc-101',
    'Call com cliente sobre memoria revisional',
    'Alinhar com a cliente o racional da planilha e preparar envio da resposta ao despacho.',
    '2026-04-09T10:00:00-03:00',
    'Dra. Helena Siqueira',
    'Google Meet',
    'client-follow-up'
  ),
  (
    'commitment-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'proc-311',
    'Revisao interna da inicial de capital de giro',
    'Conferir tese economica, anexos empresariais e pedido de tutela antes do protocolo.',
    '2026-04-10T14:30:00-03:00',
    'Dra. Julia Ramalho',
    'Sala de estrategia',
    'internal-review'
  ),
  (
    'commitment-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    'proc-205',
    'Follow-up documental de fraude PIX',
    'Cobrar documento pendente e revalidar prontidao do caso para protocolo.',
    '2026-04-11T09:30:00-03:00',
    'Dr. Caio Nascimento',
    'WhatsApp / telefone',
    'client-follow-up'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_id = excluded.process_id,
  title = excluded.title,
  description = excluded.description,
  scheduled_for = excluded.scheduled_for,
  responsible_label = excluded.responsible_label,
  location_label = excluded.location_label,
  category = excluded.category,
  updated_at = timezone('utc', now());

insert into public.procedural_deadlines (
  id,
  tenant_id,
  client_id,
  case_id,
  process_id,
  title,
  description,
  due_date,
  responsible_label,
  source_label,
  severity
)
values
  (
    'deadline-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'proc-101',
    'Responder intimacao sobre memoria de calculo',
    'Protocolar complemento tecnico da memoria discriminada e reforcar encargos abusivos.',
    '2026-04-10',
    'Dra. Helena Siqueira',
    'Diario Oficial',
    'high'
  ),
  (
    'deadline-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    'proc-312',
    'Juntar prova complementar da negativacao',
    'Anexar evidencia da restricao e do impacto operacional para sustentar tutela.',
    '2026-04-12',
    'Dra. Julia Ramalho',
    'Andamento processual',
    'high'
  ),
  (
    'deadline-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'proc-311',
    'Conferir representacao societaria antes do protocolo',
    'Validar anexos empresariais e contrato social antes da movimentacao final.',
    '2026-04-15',
    'Dra. Julia Ramalho',
    'Ato ordinatorio',
    'medium'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_id = excluded.process_id,
  title = excluded.title,
  description = excluded.description,
  due_date = excluded.due_date,
  responsible_label = excluded.responsible_label,
  source_label = excluded.source_label,
  severity = excluded.severity,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0008_contract_analyses_vertical_seed.sql
insert into public.contract_analyses (
  id,
  tenant_id,
  document_id,
  rate_label,
  cet_label,
  capitalization_label,
  fees_label,
  bundled_insurance_label,
  permanence_commission_label,
  penalty_label,
  sensitive_clauses,
  abusiveness_signals,
  suggested_thesis,
  procedural_risk,
  suggested_requests,
  executive_summary
)
values
  (
    'ca-001',
    '11111111-1111-1111-1111-111111111111',
    'doc-001',
    '2,79% a.m.',
    '3,41% a.m. | 49,62% a.a.',
    'Capitalizacao mensal com impacto relevante no custo final',
    'Tarifa de cadastro e servicos agregados embutidos no saldo financiado',
    'Seguro prestamista com indicio de venda casada',
    'Prevista de forma cumulativa com outros encargos',
    'Multa contratual de 2% e juros de mora de 1% a.m.',
    '[
      "Clausula de adesao ao seguro sem destaque claro da opcionalidade",
      "Previsao ampla de encargos em caso de inadimplemento",
      "Composicao do CET sem transparencia suficiente na formacao do custo"
    ]'::jsonb,
    '[
      "Possivel venda casada no seguro embutido",
      "CET elevado em comparacao com a narrativa comercial do contrato",
      "Encargos moratorios descritos de forma potencialmente cumulativa"
    ]'::jsonb,
    'Juros abusivos com seguro embutido e revisao do CET',
    'medium',
    '[
      "Revisao das clausulas remuneratorias e afastamento do seguro embutido",
      "Recalculo contratual com exclusao de encargos abusivos",
      "Tutela para suspensao de cobranca excessiva e vedacao de medidas restritivas"
    ]'::jsonb,
    'Contrato com bom potencial revisional, especialmente pela combinacao entre CET elevado, seguro embutido e redacao sensivel sobre encargos cumulativos.'
  ),
  (
    'ca-004',
    '11111111-1111-1111-1111-111111111111',
    'doc-004',
    '3,12% a.m.',
    '3,88% a.m. | 57,92% a.a.',
    'Capitalizacao mensal expressa em CCB com reflexo direto no custo efetivo',
    'Tarifas administrativas e custos operacionais incorporados ao contrato',
    'Cobertura acessoria sem detalhamento comercial suficiente',
    'Clausula de comissao de permanencia dependente de interpretacao restritiva',
    'Multa de 2% com encargos moratorios adicionais',
    '[
      "Capitalizacao mensal destacada em bloco tecnico de dificil leitura para o tomador",
      "Descricao pouco clara de tarifas e custos agregados",
      "Previsao de permanencia com margem para discussao sobre cumulatividade"
    ]'::jsonb,
    '[
      "Capitalizacao mensal com potencial forte de revisao",
      "CET alto para operacao de capital de giro",
      "Tarifas acessorias e custo agregado com transparencia insuficiente"
    ]'::jsonb,
    'Capitalizacao mensal indevida e revisao de encargos em CCB',
    'low',
    '[
      "Revisao contratual com limitacao de encargos remuneratorios",
      "Afastamento de cobrancas acessorias sem transparencia",
      "Tutela para estabilizar cobranca durante a discussao judicial"
    ]'::jsonb,
    'A CCB apresenta boa base para tese economica, com foco em capitalizacao mensal, CET elevado e transparencia insuficiente sobre custos agregados.'
  )
on conflict (id) do update
set
  document_id = excluded.document_id,
  rate_label = excluded.rate_label,
  cet_label = excluded.cet_label,
  capitalization_label = excluded.capitalization_label,
  fees_label = excluded.fees_label,
  bundled_insurance_label = excluded.bundled_insurance_label,
  permanence_commission_label = excluded.permanence_commission_label,
  penalty_label = excluded.penalty_label,
  sensitive_clauses = excluded.sensitive_clauses,
  abusiveness_signals = excluded.abusiveness_signals,
  suggested_thesis = excluded.suggested_thesis,
  procedural_risk = excluded.procedural_risk,
  suggested_requests = excluded.suggested_requests,
  executive_summary = excluded.executive_summary,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0009_procedural_updates_vertical_seed.sql
insert into public.procedural_updates (
  id,
  tenant_id,
  process_id,
  case_id,
  client_id,
  occurred_at,
  movement_type,
  source_court,
  source_label,
  raw_movement,
  operational_summary,
  criticality,
  clara_impact_summary,
  clara_caution,
  clara_next_actions
)
values
  (
    'upd-101',
    '11111111-1111-1111-1111-111111111111',
    'proc-101',
    'case-101',
    'cl-001',
    '2026-04-09',
    'Despacho',
    'TJSP',
    'Portal TJSP',
    'Vistos. Intime-se a parte autora para complementar memoria discriminada do calculo e esclarecer composicao dos encargos impugnados.',
    'O juizo cobrou detalhamento tecnico da planilha revisional antes de avancar na apreciacao.',
    'high',
    'O caso continua bem posicionado, mas a forca da tese depende agora de uma memoria de calculo mais didatica e tecnicamente robusta.',
    'Se a resposta sair generica, o pedido liminar pode perder tracao logo no primeiro filtro do juizo.',
    '["Revisar memoria de calculo", "Evidenciar CET e seguro embutido", "Preparar resposta objetiva ao despacho"]'::jsonb
  ),
  (
    'upd-205',
    '11111111-1111-1111-1111-111111111111',
    'proc-205',
    'case-205',
    'cl-002',
    '2026-04-09',
    'Certidao',
    'TJRJ',
    'Portal TJRJ',
    'Certifico a ausencia de documento complementar indispensavel ao regular prosseguimento da demanda.',
    'Ainda falta prova essencial para liberar o protocolo do caso de fraude PIX.',
    'medium',
    'O impacto juridico ainda e controlavel, mas o caso segue travado enquanto a prova faltante nao entrar.',
    'Nao vale sofisticar a narrativa agora; o gargalo segue sendo documental.',
    '["Cobrar documento complementar", "Atualizar cronologia do golpe", "Checar prontidao da inicial"]'::jsonb
  ),
  (
    'upd-311',
    '11111111-1111-1111-1111-111111111111',
    'proc-311',
    'case-311',
    'cl-003',
    '2026-04-10',
    'Ato ordinatorio',
    'TJMG',
    'Portal TJMG',
    'Intime-se a parte autora para conferencia dos anexos empresariais e regularidade da representacao documental.',
    'A movimentacao nao muda a tese, mas exige saneamento de anexos antes do protocolo final.',
    'low',
    'O caso segue forte. O risco imediato nao e juridico, e sim operacional por eventual erro documental.',
    'Um detalhe societario mal anexado pode atrasar um caso que ja esta maduro para ingresso.',
    '["Conferir contrato social", "Validar poderes de representacao", "Liberar protocolo apos saneamento"]'::jsonb
  ),
  (
    'upd-312',
    '11111111-1111-1111-1111-111111111111',
    'proc-312',
    'case-312',
    'cl-003',
    '2026-04-08',
    'Despacho',
    'TJMG',
    'Portal TJMG',
    'Intime-se a parte autora para apresentar prova complementar da negativacao e do dano operacional alegado.',
    'A tutela depende agora de prova objetiva da restricao e do impacto concreto na operacao da empresa.',
    'high',
    'A tese continua boa, mas o caso pede prova mais incisiva para sustentar urgencia e dano moral empresarial.',
    'Sem prova forte da restricao, o pedido de urgencia pode perder aderencia.',
    '["Reunir prova da negativacao", "Documentar impacto comercial", "Reforcar pedido de tutela"]'::jsonb
  )
on conflict (id) do update
set
  process_id = excluded.process_id,
  case_id = excluded.case_id,
  client_id = excluded.client_id,
  occurred_at = excluded.occurred_at,
  movement_type = excluded.movement_type,
  source_court = excluded.source_court,
  source_label = excluded.source_label,
  raw_movement = excluded.raw_movement,
  operational_summary = excluded.operational_summary,
  criticality = excluded.criticality,
  clara_impact_summary = excluded.clara_impact_summary,
  clara_caution = excluded.clara_caution,
  clara_next_actions = excluded.clara_next_actions,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0010_official_diary_vertical_seed.sql
insert into public.official_diary_publications (
  id,
  tenant_id,
  process_id,
  case_id,
  client_id,
  published_at,
  source_court,
  source_label,
  title,
  raw_context,
  banking_summary,
  required_action,
  urgency,
  responsible_lawyer,
  suggested_task_title,
  suggested_task_description
)
values
  (
    'pub-101',
    '11111111-1111-1111-1111-111111111111',
    'proc-101',
    'case-101',
    'cl-001',
    '2026-04-08',
    'TJSP',
    'DJE TJSP',
    'Intimacao para complemento da memoria de calculo',
    'Fica a parte autora intimada para, no prazo legal, complementar memoria discriminada do calculo e esclarecer a composicao dos encargos cobrados no contrato.',
    'A publicacao reforca a necessidade de consolidar CET, parcelas efetivas e venda casada para sustentar a revisional com maior seguranca.',
    'Juntar planilha revisional consolidada e revisar a narrativa de encargos abusivos antes da proxima manifestacao.',
    'high',
    'Dra. Helena Siqueira',
    'Responder intimacao sobre memoria de calculo',
    'Preparar resposta com memoria de calculo detalhada, CET, seguro embutido e demonstrativo dos encargos questionados.'
  ),
  (
    'pub-205',
    '11111111-1111-1111-1111-111111111111',
    'proc-205',
    'case-205',
    'cl-002',
    '2026-04-09',
    'TJRJ',
    'DJE TJRJ',
    'Certidao de pendencia documental para distribuicao',
    'Certifico que a inicial depende da juntada de documento complementar para regular prosseguimento do pedido apresentado pela parte autora.',
    'No contexto de fraude PIX, a falta de documento formal ainda enfraquece a linha probatoria e impede o ingresso seguro da acao.',
    'Cobrar documento pendente do cliente e validar se a narrativa cronologica esta pronta para protocolo.',
    'medium',
    'Dr. Caio Nascimento',
    'Destravar documento pendente para fraude PIX',
    'Acionar o cliente, receber o documento complementar e liberar a estrutura final da inicial.'
  ),
  (
    'pub-311',
    '11111111-1111-1111-1111-111111111111',
    'proc-311',
    'case-311',
    'cl-003',
    '2026-04-07',
    'TJMG',
    'DJE TJMG',
    'Ato ordinatorio para conferencia de anexos empresariais',
    'Intime-se a parte autora para confirmar regularidade dos anexos empresariais e eventual representacao da pessoa juridica nos autos.',
    'A publicacao nao altera a tese de capitalizacao mensal, mas exige saneamento documental antes do protocolo ou da continuidade da medida.',
    'Conferir contrato social, poderes e anexos empresariais antes do proximo movimento da equipe.',
    'medium',
    'Dra. Julia Ramalho',
    'Conferir anexos empresariais do capital de giro',
    'Validar representacao da empresa e anexos obrigatorios para manter o caso apto ao protocolo.'
  ),
  (
    'pub-312',
    '11111111-1111-1111-1111-111111111111',
    'proc-312',
    'case-312',
    'cl-003',
    '2026-04-07',
    'TJMG',
    'DJE TJMG',
    'Despacho exigindo prova complementar da negativacao',
    'Intime-se a parte autora para apresentar prova documental complementar acerca da inscricao restritiva e do impacto alegado, no prazo assinalado.',
    'A tese permanece boa, mas a tutela depende de prova objetiva da restricao e do dano operacional causado pela cobranca indevida.',
    'Separar notificacao de negativacao, comprovantes e demonstracao do impacto comercial para reforcar a urgencia.',
    'high',
    'Dra. Julia Ramalho',
    'Montar prova complementar da negativacao',
    'Reunir prova da restricao crediticia e do impacto comercial para sustentar tutela e danos.'
  )
on conflict (id) do update
set
  process_id = excluded.process_id,
  case_id = excluded.case_id,
  client_id = excluded.client_id,
  published_at = excluded.published_at,
  source_court = excluded.source_court,
  source_label = excluded.source_label,
  title = excluded.title,
  raw_context = excluded.raw_context,
  banking_summary = excluded.banking_summary,
  required_action = excluded.required_action,
  urgency = excluded.urgency,
  responsible_lawyer = excluded.responsible_lawyer,
  suggested_task_title = excluded.suggested_task_title,
  suggested_task_description = excluded.suggested_task_description,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0011_financial_entries_vertical_seed.sql
insert into public.financial_entries (
  id,
  tenant_id,
  client_id,
  case_id,
  kind,
  title,
  description,
  account_label,
  counterparty_label,
  amount,
  due_date,
  settled_at,
  status,
  category_label
)
values
  (
    'fin-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'income',
    'Honorarios iniciais revisional',
    'Entrada prevista para ajuizamento da revisional bancaria.',
    'Conta Principal',
    'Mariana Oliveira',
    4200.00,
    '2026-04-12',
    null,
    'open',
    'Honorarios'
  ),
  (
    'fin-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'income',
    'Parcela de contrato empresarial',
    'Receita recorrente vinculada ao caso de capital de giro.',
    'Conta Principal',
    'TechRio Comercio Ltda.',
    6800.00,
    '2026-04-08',
    '2026-04-08',
    'settled',
    'Honorarios'
  ),
  (
    'fin-003',
    '11111111-1111-1111-1111-111111111111',
    null,
    null,
    'expense',
    'Custas e diligencias',
    'Reserva para custas operacionais de protocolo.',
    'Conta Principal',
    'Tribunal / diligencia',
    740.00,
    '2026-04-15',
    null,
    'open',
    'Custas'
  ),
  (
    'fin-004',
    '11111111-1111-1111-1111-111111111111',
    null,
    null,
    'expense',
    'Assinatura de pesquisa juridica',
    'Ferramenta de apoio para jurisprudencia bancaria.',
    'Conta Principal',
    'Fornecedor juridico',
    390.00,
    '2026-04-05',
    '2026-04-05',
    'settled',
    'Software'
  ),
  (
    'fin-005',
    '11111111-1111-1111-1111-111111111111',
    null,
    null,
    'transfer',
    'Reserva para conta de custas',
    'Transferencia interna para separar valores de custas.',
    'Conta Principal',
    'Conta Custas',
    1200.00,
    '2026-04-11',
    '2026-04-11',
    'settled',
    'Transferencia'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  kind = excluded.kind,
  title = excluded.title,
  description = excluded.description,
  account_label = excluded.account_label,
  counterparty_label = excluded.counterparty_label,
  amount = excluded.amount,
  due_date = excluded.due_date,
  settled_at = excluded.settled_at,
  status = excluded.status,
  category_label = excluded.category_label,
  updated_at = timezone('utc', now());

-- >>> supabase/seeds/0012_adversaries_vertical_seed.sql
insert into public.adversaries (
  id,
  tenant_id,
  name,
  document_id,
  bank_name,
  case_summary,
  attorney_label,
  contact_label,
  status
)
values
  (
    'adv-001',
    '11111111-1111-1111-1111-111111111111',
    'Banco Pan',
    '59.285.411/0001-13',
    'Banco Pan',
    'Revisional de financiamento de veiculo',
    'Ribeiro e Falcao Advogados',
    '(11) 3333-2200 | contato@rfadv.com.br',
    'active'
  ),
  (
    'adv-002',
    '11111111-1111-1111-1111-111111111111',
    'Itau Unibanco',
    '60.701.190/0001-04',
    'Itau',
    'Fraude bancaria via PIX',
    'Contencioso Itau',
    '(11) 4004-4828 | juridico@itau.example',
    'active'
  ),
  (
    'adv-003',
    '11111111-1111-1111-1111-111111111111',
    'Banco Santander',
    '90.400.888/0001-42',
    'Santander',
    'Capital de giro e negativacao indevida',
    'Santander Juridico',
    '(11) 4004-3535 | juridico@santander.example',
    'active'
  )
on conflict (id) do update
set
  name = excluded.name,
  document_id = excluded.document_id,
  bank_name = excluded.bank_name,
  case_summary = excluded.case_summary,
  attorney_label = excluded.attorney_label,
  contact_label = excluded.contact_label,
  status = excluded.status,
  updated_at = timezone('utc', now());
