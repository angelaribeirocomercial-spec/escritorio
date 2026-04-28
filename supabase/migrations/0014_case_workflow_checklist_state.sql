alter table public.cases
  add column if not exists workflow_state jsonb not null default '{}'::jsonb,
  add column if not exists checklist_state jsonb not null default '{}'::jsonb;
