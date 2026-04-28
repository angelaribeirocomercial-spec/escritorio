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
