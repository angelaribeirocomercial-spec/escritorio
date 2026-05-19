create table if not exists public.clara_chat_threads (
  id text primary key,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  client_id text not null references public.clients (id) on delete cascade,
  case_id text not null references public.cases (id) on delete cascade,
  process_id text references public.processes (id) on delete cascade,
  document_id text references public.documents (id) on delete set null,
  source text not null
    check (source in ('dossie', 'workspace')),
  status text not null default 'active'
    check (status in ('active')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists clara_chat_threads_tenant_case_idx
  on public.clara_chat_threads (tenant_id, client_id, case_id);

create index if not exists clara_chat_threads_process_idx
  on public.clara_chat_threads (process_id);

drop trigger if exists clara_chat_threads_set_updated_at on public.clara_chat_threads;
create trigger clara_chat_threads_set_updated_at
before update on public.clara_chat_threads
for each row
execute function public.set_updated_at();

create table if not exists public.clara_chat_messages (
  id text primary key,
  thread_id text not null references public.clara_chat_threads (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  role text not null
    check (role in ('user', 'assistant')),
  text text not null default '',
  intent text,
  status text
    check (status in ('completed', 'fallback')),
  source_trace jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists clara_chat_messages_thread_idx
  on public.clara_chat_messages (thread_id, created_at);

create index if not exists clara_chat_messages_tenant_idx
  on public.clara_chat_messages (tenant_id);

alter table public.clara_chat_threads enable row level security;
alter table public.clara_chat_messages enable row level security;

drop policy if exists "tenant members can read clara chat threads" on public.clara_chat_threads;
create policy "tenant members can read clara chat threads"
on public.clara_chat_threads
for select
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_threads.tenant_id
      and memberships.is_active = true
  )
);

drop policy if exists "tenant owners and admins can manage clara chat threads" on public.clara_chat_threads;
create policy "tenant owners and admins can manage clara chat threads"
on public.clara_chat_threads
for all
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_threads.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_threads.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);

drop policy if exists "tenant members can read clara chat messages" on public.clara_chat_messages;
create policy "tenant members can read clara chat messages"
on public.clara_chat_messages
for select
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_messages.tenant_id
      and memberships.is_active = true
  )
);

drop policy if exists "tenant owners and admins can manage clara chat messages" on public.clara_chat_messages;
create policy "tenant owners and admins can manage clara chat messages"
on public.clara_chat_messages
for all
using (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_messages.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
)
with check (
  exists (
    select 1
    from public.memberships
    where memberships.user_id = auth.uid()
      and memberships.tenant_id = clara_chat_messages.tenant_id
      and memberships.is_active = true
      and memberships.role in ('owner', 'admin')
  )
);
