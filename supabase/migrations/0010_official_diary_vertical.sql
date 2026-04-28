create table if not exists public.official_diary_publications (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  process_id text not null references public.processes (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  published_at date not null,
  source_court text not null,
  source_label text not null,
  title text not null,
  raw_context text not null,
  banking_summary text not null,
  required_action text not null,
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  responsible_lawyer text not null,
  suggested_task_title text not null,
  suggested_task_description text not null,
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists official_diary_publications_tenant_id_idx
  on public.official_diary_publications (tenant_id);

create index if not exists official_diary_publications_tenant_published_at_idx
  on public.official_diary_publications (tenant_id, published_at desc);

create index if not exists official_diary_publications_process_id_idx
  on public.official_diary_publications (process_id);

drop trigger if exists official_diary_publications_set_updated_at on public.official_diary_publications;
create trigger official_diary_publications_set_updated_at
before update on public.official_diary_publications
for each row
execute function public.set_updated_at();
