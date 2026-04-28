create table if not exists public.financial_entries (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text references public.clients (id) on delete set null,
  case_id text references public.cases (id) on delete set null,
  kind text not null check (kind in ('income', 'expense', 'transfer')),
  title text not null,
  description text not null default '',
  account_label text not null,
  counterparty_label text not null default '',
  amount numeric(12, 2) not null,
  due_date date not null,
  settled_at date,
  status text not null check (status in ('open', 'settled')),
  category_label text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists financial_entries_tenant_id_idx
  on public.financial_entries (tenant_id);

create index if not exists financial_entries_tenant_kind_due_date_idx
  on public.financial_entries (tenant_id, kind, due_date);

drop trigger if exists financial_entries_set_updated_at on public.financial_entries;
create trigger financial_entries_set_updated_at
before update on public.financial_entries
for each row
execute function public.set_updated_at();
