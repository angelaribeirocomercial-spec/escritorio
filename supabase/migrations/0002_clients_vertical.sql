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
