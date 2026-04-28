insert into public.agenda_commitments (
  id,
  tenant_id,
  client_id,
  case_id,
  process_id,
  title,
  description,
  scheduled_for,
  responsible_label,
  location_label,
  category
)
values
  (
    'commitment-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'proc-101',
    'Call com cliente sobre memoria revisional',
    'Alinhar com a cliente o racional da planilha e preparar envio da resposta ao despacho.',
    '2026-04-09T10:00:00-03:00',
    'Dra. Helena Siqueira',
    'Google Meet',
    'client-follow-up'
  ),
  (
    'commitment-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'proc-311',
    'Revisao interna da inicial de capital de giro',
    'Conferir tese economica, anexos empresariais e pedido de tutela antes do protocolo.',
    '2026-04-10T14:30:00-03:00',
    'Dra. Julia Ramalho',
    'Sala de estrategia',
    'internal-review'
  ),
  (
    'commitment-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    'proc-205',
    'Follow-up documental de fraude PIX',
    'Cobrar documento pendente e revalidar prontidao do caso para protocolo.',
    '2026-04-11T09:30:00-03:00',
    'Dr. Caio Nascimento',
    'WhatsApp / telefone',
    'client-follow-up'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_id = excluded.process_id,
  title = excluded.title,
  description = excluded.description,
  scheduled_for = excluded.scheduled_for,
  responsible_label = excluded.responsible_label,
  location_label = excluded.location_label,
  category = excluded.category,
  updated_at = timezone('utc', now());

insert into public.procedural_deadlines (
  id,
  tenant_id,
  client_id,
  case_id,
  process_id,
  title,
  description,
  due_date,
  responsible_label,
  source_label,
  severity
)
values
  (
    'deadline-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'proc-101',
    'Responder intimacao sobre memoria de calculo',
    'Protocolar complemento tecnico da memoria discriminada e reforcar encargos abusivos.',
    '2026-04-10',
    'Dra. Helena Siqueira',
    'Diario Oficial',
    'high'
  ),
  (
    'deadline-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    'proc-312',
    'Juntar prova complementar da negativacao',
    'Anexar evidencia da restricao e do impacto operacional para sustentar tutela.',
    '2026-04-12',
    'Dra. Julia Ramalho',
    'Andamento processual',
    'high'
  ),
  (
    'deadline-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'proc-311',
    'Conferir representacao societaria antes do protocolo',
    'Validar anexos empresariais e contrato social antes da movimentacao final.',
    '2026-04-15',
    'Dra. Julia Ramalho',
    'Ato ordinatorio',
    'medium'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_id = excluded.process_id,
  title = excluded.title,
  description = excluded.description,
  due_date = excluded.due_date,
  responsible_label = excluded.responsible_label,
  source_label = excluded.source_label,
  severity = excluded.severity,
  updated_at = timezone('utc', now());
