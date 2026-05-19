alter table public.clients
  alter column document_id drop not null,
  alter column email drop not null,
  alter column whatsapp drop not null,
  alter column lead_source drop not null,
  alter column bank_name drop not null,
  alter column fees_label drop not null;

alter table public.cases
  alter column bank_name drop not null,
  alter column contract_number drop not null;

do $$
declare
  current_constraint_name text;
begin
  select conname
    into current_constraint_name
  from pg_constraint
  where conrelid = 'public.cases'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%niche%';

  if current_constraint_name is not null then
    execute format('alter table public.cases drop constraint %I', current_constraint_name);
  end if;
end $$;

alter table public.cases
  add constraint cases_niche_check
  check (
    niche in (
      'triagem-inicial',
      'revisional',
      'fraude',
      'busca-apreensao',
      'cartao-consignado',
      'beneficio-descontos'
    )
  );
