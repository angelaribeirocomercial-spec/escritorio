insert into public.adversaries (
  id,
  tenant_id,
  name,
  document_id,
  bank_name,
  case_summary,
  attorney_label,
  contact_label,
  status
)
values
  (
    'adv-001',
    '11111111-1111-1111-1111-111111111111',
    'Banco Pan',
    '59.285.411/0001-13',
    'Banco Pan',
    'Revisional de financiamento de veiculo',
    'Ribeiro e Falcao Advogados',
    '(11) 3333-2200 | contato@rfadv.com.br',
    'active'
  ),
  (
    'adv-002',
    '11111111-1111-1111-1111-111111111111',
    'Itau Unibanco',
    '60.701.190/0001-04',
    'Itau',
    'Fraude bancaria via PIX',
    'Contencioso Itau',
    '(11) 4004-4828 | juridico@itau.example',
    'active'
  ),
  (
    'adv-003',
    '11111111-1111-1111-1111-111111111111',
    'Banco Santander',
    '90.400.888/0001-42',
    'Santander',
    'Fraude consignada / RMC e busca e apreensao',
    'Santander Juridico',
    '(11) 4004-3535 | juridico@santander.example',
    'active'
  )
on conflict (id) do update
set
  name = excluded.name,
  document_id = excluded.document_id,
  bank_name = excluded.bank_name,
  case_summary = excluded.case_summary,
  attorney_label = excluded.attorney_label,
  contact_label = excluded.contact_label,
  status = excluded.status,
  updated_at = timezone('utc', now());
