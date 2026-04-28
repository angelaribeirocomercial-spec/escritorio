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
