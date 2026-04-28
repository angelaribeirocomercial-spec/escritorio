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
