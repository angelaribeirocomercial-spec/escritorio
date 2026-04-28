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
