create table if not exists public.detected_abuses (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  contract_id text not null references public.documents (id) on delete cascade,
  contract_analysis_id text not null references public.contract_analyses (id) on delete cascade,
  signal_key text not null,
  signal_label text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  evidence_label text not null,
  financial_impact_label text not null,
  legal_suggestion text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists detected_abuses_tenant_case_contract_signal_key_idx
  on public.detected_abuses (tenant_id, case_id, contract_id, signal_key);

create index if not exists detected_abuses_tenant_id_idx
  on public.detected_abuses (tenant_id);

create index if not exists detected_abuses_case_id_idx
  on public.detected_abuses (case_id);

create index if not exists detected_abuses_contract_id_idx
  on public.detected_abuses (contract_id);

drop trigger if exists detected_abuses_set_updated_at on public.detected_abuses;
create trigger detected_abuses_set_updated_at
before update on public.detected_abuses
for each row
execute function public.set_updated_at();
