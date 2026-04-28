insert into public.processes (
  id,
  tenant_id,
  client_id,
  case_id,
  process_number,
  tribunal,
  court_district,
  court_name,
  procedural_phase,
  status,
  responsible_lawyer,
  monitoring_mode,
  latest_timeline,
  banking_case_snapshot
)
values
  (
    'proc-101',
    '11111111-1111-1111-1111-111111111111',
    'cl-001',
    'case-101',
    '1008421-19.2026.8.26.0100',
    'TJSP',
    'Sao Paulo/SP',
    '12a Vara Civel do Foro Central',
    'Tutela e citacao inicial',
    'active',
    'Dra. Helena Siqueira',
    'court',
    '[
      {"id":"proc-101-t1","occurredAt":"2026-04-02","title":"Distribuicao da acao","description":"Peticao inicial distribuida com pedido de revisao contratual e tutela para limitar cobranca.","source":"TJSP","criticality":"medium"},
      {"id":"proc-101-t2","occurredAt":"2026-04-05","title":"Conclusos para apreciacao da tutela","description":"Magistrado recebeu os autos para analise do pedido liminar.","source":"TJSP","criticality":"high"},
      {"id":"proc-101-t3","occurredAt":"2026-04-08","title":"Intimacao para complementar planilha","description":"Secretaria solicitou reforco da memoria de calculo contratual.","source":"TJSP","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-101","clientId":"cl-001","title":"Revisional de financiamento de veiculo","bankName":"Banco Pan","processNumber":"1008421-19.2026.8.26.0100","contractNumber":"PAN-44-99281","claimType":"acao_revisional","stage":"Analise inicial","status":"active","amountInDispute":68400,"estimatedValue":32200,"mainThesis":"Juros abusivos e seguro embutido","legalRisk":"medium","suggestedStrategy":"Consolidar memoria de calculo, destacar venda casada e estruturar pedido de revisao contratual com tutela para suspensao de cobranca excessiva.","ownerLabel":"Dra. Helena Siqueira","niche":"revisional","linkedDocuments":["Contrato bancario","Planilha de parcelas","Extratos","Comprovante de renda"],"linkedTasks":["Revisar memoria de calculo","Validar clausula de seguro embutido","Preparar peticao inicial"],"linkedDeadlines":["Coletar documentos complementares ate 14/04/2026","Aprovar estrategia interna ate 16/04/2026"],"lexiaInsights":["Boa aderencia a tese revisional com foco em venda casada.","Ha espaco para pedido cumulativo de repeticao de indebito.","Cliente tem documentacao suficiente para primeira peca."]}'::jsonb
  ),
  (
    'proc-205',
    '11111111-1111-1111-1111-111111111111',
    'cl-002',
    'case-205',
    '5011274-65.2026.8.19.0001',
    'TJRJ',
    'Rio de Janeiro/RJ',
    '7o Juizado Especial Civel da Capital',
    'Pre-protocolo estrategico',
    'awaiting-filing',
    'Dr. Caio Nascimento',
    'manual',
    '[
      {"id":"proc-205-t1","occurredAt":"2026-04-01","title":"Checklist probatorio iniciado","description":"Equipe iniciou consolidacao dos comprovantes PIX e historico de atendimento bancario.","source":"ADVX","criticality":"medium"},
      {"id":"proc-205-t2","occurredAt":"2026-04-06","title":"Boletim de ocorrencia pendente","description":"Sem o B.O., a estrategia segue aguardando validacao documental final.","source":"ADVX","criticality":"high"},
      {"id":"proc-205-t3","occurredAt":"2026-04-09","title":"Rascunho inicial liberado","description":"Estrutura de fatos e dano moral preparada para protocolo assim que a prova faltante entrar.","source":"ADVX","criticality":"low"}
    ]'::jsonb,
    '{"id":"case-205","clientId":"cl-002","title":"Fraude bancaria via PIX","bankName":"Itau","processNumber":"5011274-65.2026.8.19.0001","contractNumber":"PIX-FRD-1180","claimType":"fraude_bancaria","stage":"Aguardando documentos","status":"awaiting-action","amountInDispute":18750,"estimatedValue":41000,"mainThesis":"Falha de seguranca e dano moral","legalRisk":"medium","suggestedStrategy":"Fechar cronologia do evento, reforcar prova documental e estruturar narrativa de falha na seguranca da operacao PIX.","ownerLabel":"Dr. Caio Nascimento","niche":"fraude","linkedDocuments":["Comprovantes PIX","Atendimento bancario","Capturas de tela"],"linkedTasks":["Cobrar boletim de ocorrencia","Solicitar comprovante bancario detalhado","Montar cronologia do golpe"],"linkedDeadlines":["Revisar pendencias documentais em 11/04/2026"],"lexiaInsights":["Sem boletim de ocorrencia, a narrativa probatoria fica fragil.","A tese principal permanece viavel se a cronologia for bem consolidada."]}'::jsonb
  ),
  (
    'proc-311',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-311',
    '7012844-11.2026.8.13.0024',
    'TJMG',
    'Belo Horizonte/MG',
    '4a Vara Empresarial e Civel',
    'Inicial em revisao final',
    'monitoring',
    'Dra. Julia Ramalho',
    'oab',
    '[
      {"id":"proc-311-t1","occurredAt":"2026-03-29","title":"Leitura economica consolidada","description":"Planilha de encargos validada com foco em capitalizacao mensal e CET.","source":"ADVX","criticality":"medium"},
      {"id":"proc-311-t2","occurredAt":"2026-04-04","title":"Minuta encaminhada para revisao interna","description":"Peca inicial foi encaminhada para revisao da tese economica principal.","source":"ADVX","criticality":"low"},
      {"id":"proc-311-t3","occurredAt":"2026-04-09","title":"Janela de protocolo aberta","description":"Caso pronto para ingresso apos ultima checagem de anexos empresariais.","source":"ADVX","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-311","clientId":"cl-003","title":"Capital de giro com juros abusivos","bankName":"Santander","processNumber":"7012844-11.2026.8.13.0024","contractNumber":"CCB-88372","claimType":"juros_abusivos","stage":"Peca inicial em preparacao","status":"active","amountInDispute":248000,"estimatedValue":118000,"mainThesis":"Capitalizacao mensal indevida","legalRisk":"low","suggestedStrategy":"Combinar revisao contratual com pedido de tutela para limitar cobranca e reforcar a leitura economica do capital de giro.","ownerLabel":"Dra. Julia Ramalho","niche":"revisional","linkedDocuments":["CCB","Extratos da conta","Email de cobranca","Comprovantes bancarios","Contrato social"],"linkedTasks":["Finalizar fatos resumidos","Conferir planilha de encargos","Revisar fundamentos da inicial"],"linkedDeadlines":["Submeter minuta para revisao em 15/04/2026","Validar anexos ate 17/04/2026"],"lexiaInsights":["Caso com boa combinacao entre tese economica e prova documental.","Recomendavel destacar capitalizacao mensal e CET total no resumo executivo."]}'::jsonb
  ),
  (
    'proc-312',
    '11111111-1111-1111-1111-111111111111',
    'cl-003',
    'case-312',
    '7012855-49.2026.8.13.0024',
    'TJMG',
    'Belo Horizonte/MG',
    '3a Vara Civel de Belo Horizonte',
    'Suspensao da negativacao',
    'stayed',
    'Dra. Julia Ramalho',
    'court',
    '[
      {"id":"proc-312-t1","occurredAt":"2026-03-27","title":"Tutela parcialmente apreciada","description":"Juizo indicou necessidade de complemento da prova de restricao indevida.","source":"TJMG","criticality":"high"},
      {"id":"proc-312-t2","occurredAt":"2026-04-03","title":"Autos em carga para manifestacao","description":"Equipe separou comprovantes de negativacao e cobrancas correlatas.","source":"TJMG","criticality":"medium"},
      {"id":"proc-312-t3","occurredAt":"2026-04-07","title":"Processo temporariamente suspenso","description":"Fluxo parado ate juntada de documento complementar exigido pelo juizo.","source":"TJMG","criticality":"medium"}
    ]'::jsonb,
    '{"id":"case-312","clientId":"cl-003","title":"Negativacao indevida vinculada ao contrato","bankName":"Santander","processNumber":"7012855-49.2026.8.13.0024","contractNumber":"NEG-55210","claimType":"negativacao_indevida","stage":"Documentacao completa","status":"active","amountInDispute":32000,"estimatedValue":24000,"mainThesis":"Suspensao de cobranca e danos","legalRisk":"low","suggestedStrategy":"Estruturar urgencia na retirada da restricao e combinar pedido declaratorio com danos morais bancarios.","ownerLabel":"Dra. Julia Ramalho","niche":"revisional","linkedDocuments":["Email de cobranca","Comprovantes bancarios","Notificacao de negativacao"],"linkedTasks":["Validar prova da negativacao","Fechar pedido de tutela","Revisar danos morais"],"linkedDeadlines":["Consolidar anexos ate 13/04/2026"],"lexiaInsights":["Caso apto para narrativa objetiva com pedido urgente.","Documentacao completa melhora o potencial de tutela."]}'::jsonb
  )
on conflict (id) do update
set
  client_id = excluded.client_id,
  case_id = excluded.case_id,
  process_number = excluded.process_number,
  tribunal = excluded.tribunal,
  court_district = excluded.court_district,
  court_name = excluded.court_name,
  procedural_phase = excluded.procedural_phase,
  status = excluded.status,
  responsible_lawyer = excluded.responsible_lawyer,
  monitoring_mode = excluded.monitoring_mode,
  latest_timeline = excluded.latest_timeline,
  banking_case_snapshot = excluded.banking_case_snapshot,
  updated_at = timezone('utc', now());
