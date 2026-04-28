create table if not exists public.documents (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  file_name text not null,
  original_file_name text,
  document_type text not null,
  category text not null,
  tags jsonb not null default '[]'::jsonb,
  ai_status text not null check (ai_status in ('not_analyzed', 'analyzed', 'needs_review')),
  summary text not null default '',
  page_count integer not null default 0,
  uploaded_at date not null,
  preview_label text not null default '',
  storage_bucket text not null default '',
  storage_path text not null default '',
  storage_mime_type text not null default 'application/octet-stream',
  storage_size_bytes bigint not null default 0,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists documents_tenant_id_idx
  on public.documents (tenant_id);

create index if not exists documents_case_id_idx
  on public.documents (case_id);

create index if not exists documents_client_id_idx
  on public.documents (client_id);

create index if not exists documents_tenant_type_idx
  on public.documents (tenant_id, document_type);

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at
before update on public.documents
for each row
execute function public.set_updated_at();
