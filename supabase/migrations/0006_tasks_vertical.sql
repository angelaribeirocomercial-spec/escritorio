create table if not exists public.tasks (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_label text not null,
  due_date date not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null check (status in ('todo', 'in_progress', 'done')),
  notes text not null default '',
  checklist jsonb not null default '[]'::jsonb,
  suggested_by_claim_type text not null default '',
  lexia_next_step text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists tasks_tenant_id_idx
  on public.tasks (tenant_id);

create index if not exists tasks_case_id_idx
  on public.tasks (case_id);

create index if not exists tasks_client_id_idx
  on public.tasks (client_id);

create index if not exists tasks_tenant_due_date_idx
  on public.tasks (tenant_id, due_date);

create index if not exists tasks_tenant_priority_idx
  on public.tasks (tenant_id, priority);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();
