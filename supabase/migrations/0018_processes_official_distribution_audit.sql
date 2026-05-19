alter table public.processes
  add column if not exists local_reference_number text,
  add column if not exists official_process_number text,
  add column if not exists official_distribution_date date,
  add column if not exists official_source text check (official_source in ('manual_confirmed', 'official_import')),
  add column if not exists official_distribution_status text not null default 'preparatory_local'
    check (official_distribution_status in ('preparatory_local', 'attempt_failed', 'official_confirmed')),
  add column if not exists protocol_receipt_document_id text references public.documents (id) on delete set null,
  add column if not exists distribution_audit_trail jsonb not null default '[]'::jsonb;

update public.processes
set
  local_reference_number = coalesce(local_reference_number, process_number),
  official_process_number = case
    when status in ('active', 'monitoring', 'stayed', 'closed') then coalesce(official_process_number, process_number)
    else official_process_number
  end,
  official_distribution_date = case
    when status in ('active', 'monitoring', 'stayed', 'closed') then coalesce(official_distribution_date, created_at::date)
    else official_distribution_date
  end,
  official_source = case
    when status in ('active', 'monitoring', 'stayed', 'closed') then coalesce(official_source, 'manual_confirmed')
    else official_source
  end,
  official_distribution_status = case
    when status in ('active', 'monitoring', 'stayed', 'closed') then 'official_confirmed'
    when status = 'awaiting-filing' then 'preparatory_local'
    else official_distribution_status
  end
where local_reference_number is null
   or status in ('active', 'monitoring', 'stayed', 'closed');
