insert into public.tasks (
  id,
  tenant_id,
  client_id,
  case_id,
  title,
  description,
  assignee_label,
  due_date,
  priority,
  status,
  notes,
  checklist,
  suggested_by_claim_type,
  lexia_next_step
)
values
  (
    'task-001',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'Conferir memoria de calculo revisional',
    'Validar divergencia entre CET contratado, parcelas efetivas e seguro embutido antes da peca inicial.',
    'Dra. Helena Siqueira',
    '2026-04-11',
    'urgent',
    'in_progress',
    'Necessario fechar memoria com base na planilha e destacar venda casada no resumo executivo.',
    '[
      {"id":"task-001-1","label":"Conferir documentos","done":true},
      {"id":"task-001-2","label":"Solicitar contrato completo","done":true},
      {"id":"task-001-3","label":"Analisar abusividades","done":true},
      {"id":"task-001-4","label":"Definir tese","done":false},
      {"id":"task-001-5","label":"Gerar peticao inicial","done":false}
    ]'::jsonb,
    'Checklist sugerido para acao revisional.',
    'Fechar a comparacao entre parcelas e CET para sustentar a tese de juros abusivos com seguro embutido.'
  ),
  (
    'task-002',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    'Cobrar boletim de ocorrencia do cliente',
    'Formalizar a pendencia documental indispensavel para robustecer a tese de fraude bancaria via PIX.',
    'Dr. Caio Nascimento',
    '2026-04-10',
    'high',
    'todo',
    'Sem o boletim, a narrativa de seguranca e responsabilidade do banco perde forca probatoria.',
    '[
      {"id":"task-002-1","label":"Listar documentos faltantes","done":true},
      {"id":"task-002-2","label":"Enviar checklist ao cliente","done":true},
      {"id":"task-002-3","label":"Receber boletim de ocorrencia","done":false},
      {"id":"task-002-4","label":"Atualizar cronologia do golpe","done":false}
    ]'::jsonb,
    'Checklist sugerido para fraude bancaria PIX.',
    'Assim que o boletim entrar, consolidar cronologia e revisar pedido de dano moral.'
  ),
  (
    'task-003',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    'Revisar fundamentos da inicial de capital de giro',
    'Revisao final dos fundamentos sobre capitalizacao mensal, CET e encargos remuneratorios.',
    'Dra. Julia Ramalho',
    '2026-04-15',
    'medium',
    'in_progress',
    'A peca esta bem encaminhada; falta amarrar com mais clareza o pedido de tutela para limitacao de cobranca.',
    '[
      {"id":"task-003-1","label":"Finalizar fatos resumidos","done":true},
      {"id":"task-003-2","label":"Conferir planilha de encargos","done":true},
      {"id":"task-003-3","label":"Revisar fundamentos da inicial","done":false},
      {"id":"task-003-4","label":"Submeter minuta para revisao","done":false}
    ]'::jsonb,
    'Checklist sugerido para juros abusivos em CCB.',
    'Enfatizar capitalizacao mensal e pedido de limitacao de cobranca no topico de urgencia.'
  ),
  (
    'task-004',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    'Fechar pedido de tutela para retirada da negativacao',
    'Consolidar os argumentos de urgencia e a prova da restricao crediticia indevida.',
    'Dra. Julia Ramalho',
    '2026-04-12',
    'urgent',
    'todo',
    'Caso apto para narrativa enxuta, com foco em urgencia e impacto operacional na empresa cliente.',
    '[
      {"id":"task-004-1","label":"Validar prova da negativacao","done":true},
      {"id":"task-004-2","label":"Fechar pedido de tutela","done":false},
      {"id":"task-004-3","label":"Revisar danos morais","done":false}
    ]'::jsonb,
    'Checklist sugerido para negativacao indevida.',
    'Priorizar o pedido liminar e anexar prova objetiva do impacto comercial da restricao.'
  ),
  (
    'task-005',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    'Atualizar cliente sobre estrategia revisional',
    'Enviar resumo claro com status do caso, documentos utilizados e proximos passos da peca inicial.',
    'Time de Atendimento',
    '2026-04-13',
    'low',
    'done',
    'Atualizacao deve reforcar seguranca do cliente e alinhar expectativa sobre o tempo de ajuizamento.',
    '[
      {"id":"task-005-1","label":"Consolidar status interno","done":true},
      {"id":"task-005-2","label":"Montar resumo ao cliente","done":true},
      {"id":"task-005-3","label":"Registrar envio no historico","done":true}
    ]'::jsonb,
    'Checklist sugerido para atualizacao de cliente em revisional.',
    'Usar linguagem objetiva e reforcar que a estrategia esta baseada em seguro embutido e CET elevado.'
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  title = excluded.title,
  description = excluded.description,
  assignee_label = excluded.assignee_label,
  due_date = excluded.due_date,
  priority = excluded.priority,
  status = excluded.status,
  notes = excluded.notes,
  checklist = excluded.checklist,
  suggested_by_claim_type = excluded.suggested_by_claim_type,
  lexia_next_step = excluded.lexia_next_step,
  updated_at = timezone('utc', now());
