alter table public.documents
  add column if not exists structured_extraction jsonb not null default '{}'::jsonb,
  add column if not exists extraction_source_trace jsonb not null default '{}'::jsonb,
  add column if not exists extraction_error text,
  add column if not exists extracted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists review_notes text,
  add column if not exists review_status text not null default 'pending'
    check (review_status in ('pending', 'reviewed', 'corrected'));

alter table public.contract_analyses
  add column if not exists case_id text references public.cases (id) on delete cascade,
  add column if not exists calculation_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists bacen_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists strategic_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists petition_snapshot jsonb not null default '{}'::jsonb,
  add column if not exists approved_for_filing boolean not null default false,
  add column if not exists synced_at timestamptz not null default timezone('utc', now());

update public.contract_analyses analyses
set case_id = documents.case_id
from public.documents
where analyses.document_id = documents.id
  and analyses.case_id is null;

create index if not exists contract_analyses_case_id_idx
  on public.contract_analyses (case_id);

create table if not exists public.process_filings (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  process_id text not null references public.processes (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  kind text not null
    check (kind in ('peticao_inicial', 'contestacao', 'replica', 'manifestacao', 'recurso', 'cumprimento_sentenca', 'peticao_intercorrente')),
  title text not null,
  status text not null
    check (status in ('draft', 'in_review', 'approved', 'filed', 'fulfilled')),
  source_minuta_id text references public.minutas (id) on delete set null,
  linked_update_id text references public.procedural_updates (id) on delete set null,
  summary text not null default '',
  next_action text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists process_filings_tenant_id_idx
  on public.process_filings (tenant_id);

create index if not exists process_filings_process_id_idx
  on public.process_filings (process_id);

create index if not exists process_filings_case_id_idx
  on public.process_filings (case_id);

drop trigger if exists process_filings_set_updated_at on public.process_filings;
create trigger process_filings_set_updated_at
before update on public.process_filings
for each row
execute function public.set_updated_at();

alter table public.process_filings enable row level security;

drop policy if exists "tenant members can read process filings" on public.process_filings;
create policy "tenant members can read process filings"
on public.process_filings
for select
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = process_filings.tenant_id
      and memberships.is_active = true
  )
);

drop policy if exists "tenant owners and admins can manage process filings" on public.process_filings;
create policy "tenant owners and admins can manage process filings"
on public.process_filings
for all
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = process_filings.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = process_filings.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
