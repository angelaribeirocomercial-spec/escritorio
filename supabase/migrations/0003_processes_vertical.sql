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
