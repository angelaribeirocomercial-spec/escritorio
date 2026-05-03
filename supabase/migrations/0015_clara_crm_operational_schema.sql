create table if not exists public.minutas (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  title text not null,
  body text not null default '',
  status text not null check (status in ('draft', 'in_review', 'approved', 'sent', 'closed')) default 'draft',
  output_format text not null check (output_format in ('docx', 'pdf', 'print')) default 'docx',
  summary text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists minutas_tenant_id_idx
  on public.minutas (tenant_id);

create index if not exists minutas_case_id_idx
  on public.minutas (case_id);

create index if not exists minutas_client_id_idx
  on public.minutas (client_id);

drop trigger if exists minutas_set_updated_at on public.minutas;
create trigger minutas_set_updated_at
before update on public.minutas
for each row
execute function public.set_updated_at();

create table if not exists public.versoes_peca (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  minuta_id text not null references public.minutas (id) on delete cascade,
  version_number integer not null,
  content text not null default '',
  review_status text not null check (review_status in ('draft', 'reviewed', 'approved')) default 'draft',
  source_trace jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (minuta_id, version_number)
);

create index if not exists versoes_peca_tenant_id_idx
  on public.versoes_peca (tenant_id);

create index if not exists versoes_peca_minuta_id_idx
  on public.versoes_peca (minuta_id);

drop trigger if exists versoes_peca_set_updated_at on public.versoes_peca;
create trigger versoes_peca_set_updated_at
before update on public.versoes_peca
for each row
execute function public.set_updated_at();

create table if not exists public.modelos_internos (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  category text not null,
  body text not null default '',
  status text not null check (status in ('active', 'archived')) default 'active',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists modelos_internos_tenant_id_idx
  on public.modelos_internos (tenant_id);

create index if not exists modelos_internos_tenant_category_idx
  on public.modelos_internos (tenant_id, category);

drop trigger if exists modelos_internos_set_updated_at on public.modelos_internos;
create trigger modelos_internos_set_updated_at
before update on public.modelos_internos
for each row
execute function public.set_updated_at();

create table if not exists public.teses_argumentos (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  claim_type text not null,
  title text not null,
  argument text not null default '',
  source text not null default '',
  status text not null check (status in ('active', 'archived')) default 'active',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists teses_argumentos_tenant_id_idx
  on public.teses_argumentos (tenant_id);

create index if not exists teses_argumentos_tenant_claim_type_idx
  on public.teses_argumentos (tenant_id, claim_type);

drop trigger if exists teses_argumentos_set_updated_at on public.teses_argumentos;
create trigger teses_argumentos_set_updated_at
before update on public.teses_argumentos
for each row
execute function public.set_updated_at();

create table if not exists public.fontes_externas_consultadas (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  source_id text not null,
  source_label text not null,
  scope text not null,
  query text not null,
  status text not null check (status in ('not_consulted', 'consulted', 'unavailable', 'failed')) default 'not_consulted',
  execution_id text not null default '',
  source_trace jsonb not null default '{}'::jsonb,
  consulted_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists fontes_externas_consultadas_tenant_id_idx
  on public.fontes_externas_consultadas (tenant_id);

create index if not exists fontes_externas_consultadas_source_id_idx
  on public.fontes_externas_consultadas (tenant_id, source_id);

create index if not exists fontes_externas_consultadas_execution_id_idx
  on public.fontes_externas_consultadas (tenant_id, execution_id);

drop trigger if exists fontes_externas_consultadas_set_updated_at on public.fontes_externas_consultadas;
create trigger fontes_externas_consultadas_set_updated_at
before update on public.fontes_externas_consultadas
for each row
execute function public.set_updated_at();

create table if not exists public.resultados_api (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  source_name text not null,
  endpoint text not null,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  status text not null check (status in ('success', 'failed', 'unavailable')) default 'success',
  execution_id text not null default '',
  requested_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists resultados_api_tenant_id_idx
  on public.resultados_api (tenant_id);

create index if not exists resultados_api_source_name_idx
  on public.resultados_api (tenant_id, source_name);

create index if not exists resultados_api_execution_id_idx
  on public.resultados_api (tenant_id, execution_id);

drop trigger if exists resultados_api_set_updated_at on public.resultados_api;
create trigger resultados_api_set_updated_at
before update on public.resultados_api
for each row
execute function public.set_updated_at();

create table if not exists public.logs_execucao_clara (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  execution_id text not null,
  task_type text not null,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  source_trace jsonb not null default '{}'::jsonb,
  status text not null check (status in ('success', 'warning', 'failed')) default 'success',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists logs_execucao_clara_tenant_id_idx
  on public.logs_execucao_clara (tenant_id);

create index if not exists logs_execucao_clara_execution_id_idx
  on public.logs_execucao_clara (tenant_id, execution_id);

drop trigger if exists logs_execucao_clara_set_updated_at on public.logs_execucao_clara;
create trigger logs_execucao_clara_set_updated_at
before update on public.logs_execucao_clara
for each row
execute function public.set_updated_at();

create table if not exists public.observacoes_revisor_humano (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  minuta_id text references public.minutas (id) on delete cascade,
  case_id text references public.cases (id) on delete cascade,
  review_note text not null,
  status_revisao text not null check (status_revisao in ('pending', 'approved', 'rejected')) default 'pending',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists observacoes_revisor_humano_tenant_id_idx
  on public.observacoes_revisor_humano (tenant_id);

create index if not exists observacoes_revisor_humano_minuta_id_idx
  on public.observacoes_revisor_humano (minuta_id);

create index if not exists observacoes_revisor_humano_case_id_idx
  on public.observacoes_revisor_humano (case_id);

drop trigger if exists observacoes_revisor_humano_set_updated_at on public.observacoes_revisor_humano;
create trigger observacoes_revisor_humano_set_updated_at
before update on public.observacoes_revisor_humano
for each row
execute function public.set_updated_at();

create table if not exists public.crm_pipeline_stages (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  order_index integer not null,
  description text not null default '',
  status text not null check (status in ('active', 'archived')) default 'active',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, order_index)
);

create index if not exists crm_pipeline_stages_tenant_id_idx
  on public.crm_pipeline_stages (tenant_id);

drop trigger if exists crm_pipeline_stages_set_updated_at on public.crm_pipeline_stages;
create trigger crm_pipeline_stages_set_updated_at
before update on public.crm_pipeline_stages
for each row
execute function public.set_updated_at();

create table if not exists public.crm_leads (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text references public.clients (id) on delete set null,
  case_id text references public.cases (id) on delete set null,
  full_name text not null,
  bank_name text not null default '',
  source_channel text not null default '',
  pipeline_stage text not null default '',
  stage_label text not null default '',
  risk_label text not null default '',
  next_action text not null default '',
  summary text not null default '',
  status text not null check (status in ('active', 'converted', 'lost')) default 'active',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_leads_tenant_id_idx
  on public.crm_leads (tenant_id);

create index if not exists crm_leads_tenant_status_idx
  on public.crm_leads (tenant_id, status);

create index if not exists crm_leads_client_id_idx
  on public.crm_leads (client_id);

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
before update on public.crm_leads
for each row
execute function public.set_updated_at();

create table if not exists public.crm_followups (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id text references public.crm_leads (id) on delete cascade,
  note text not null,
  due_date date,
  status text not null check (status in ('open', 'done', 'canceled')) default 'open',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_followups_tenant_id_idx
  on public.crm_followups (tenant_id);

create index if not exists crm_followups_lead_id_idx
  on public.crm_followups (lead_id);

drop trigger if exists crm_followups_set_updated_at on public.crm_followups;
create trigger crm_followups_set_updated_at
before update on public.crm_followups
for each row
execute function public.set_updated_at();

create table if not exists public.crm_conversas (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id text references public.crm_leads (id) on delete cascade,
  channel text not null default '',
  summary text not null default '',
  last_message_at timestamptz,
  status text not null check (status in ('open', 'closed')) default 'open',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_conversas_tenant_id_idx
  on public.crm_conversas (tenant_id);

create index if not exists crm_conversas_lead_id_idx
  on public.crm_conversas (lead_id);

drop trigger if exists crm_conversas_set_updated_at on public.crm_conversas;
create trigger crm_conversas_set_updated_at
before update on public.crm_conversas
for each row
execute function public.set_updated_at();

create table if not exists public.crm_contratos (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  lead_id text references public.crm_leads (id) on delete cascade,
  title text not null,
  status text not null check (status in ('draft', 'review', 'signed', 'archived')) default 'draft',
  signed_at date,
  source_label text not null default '',
  summary text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists crm_contratos_tenant_id_idx
  on public.crm_contratos (tenant_id);

create index if not exists crm_contratos_lead_id_idx
  on public.crm_contratos (lead_id);

drop trigger if exists crm_contratos_set_updated_at on public.crm_contratos;
create trigger crm_contratos_set_updated_at
before update on public.crm_contratos
for each row
execute function public.set_updated_at();
