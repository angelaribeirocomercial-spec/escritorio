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
