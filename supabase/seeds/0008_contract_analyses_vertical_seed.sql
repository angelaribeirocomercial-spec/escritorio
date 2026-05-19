insert into public.contract_analyses (
  id,
  tenant_id,
  document_id,
  rate_label,
  cet_label,
  capitalization_label,
  fees_label,
  bundled_insurance_label,
  permanence_commission_label,
  penalty_label,
  sensitive_clauses,
  abusiveness_signals,
  suggested_thesis,
  procedural_risk,
  suggested_requests,
  executive_summary
)
values
  (
    'ca-001',
    '11111111-1111-1111-1111-111111111111',
    'doc-001',
    '2,79% a.m.',
    '3,41% a.m. | 49,62% a.a.',
    'Capitalizacao mensal com impacto relevante no custo final',
    'Tarifa de cadastro e servicos agregados embutidos no saldo financiado',
    'Seguro prestamista com indicio de venda casada',
    'Prevista de forma cumulativa com outros encargos',
    'Multa contratual de 2% e juros de mora de 1% a.m.',
    '[
      "Clausula de adesao ao seguro sem destaque claro da opcionalidade",
      "Previsao ampla de encargos em caso de inadimplemento",
      "Composicao do CET sem transparencia suficiente na formacao do custo"
    ]'::jsonb,
    '[
      "Possivel venda casada no seguro embutido",
      "CET elevado em comparacao com a narrativa comercial do contrato",
      "Encargos moratorios descritos de forma potencialmente cumulativa"
    ]'::jsonb,
    'Juros abusivos com seguro embutido e revisao do CET',
    'medium',
    '[
      "Revisao das clausulas remuneratorias e afastamento do seguro embutido",
      "Recalculo contratual com exclusao de encargos abusivos",
      "Tutela para suspensao de cobranca excessiva e vedacao de medidas restritivas"
    ]'::jsonb,
    'Contrato com bom potencial revisional, especialmente pela combinacao entre CET elevado, seguro embutido e redacao sensivel sobre encargos cumulativos.'
  ),
  (
    'ca-004',
    '11111111-1111-1111-1111-111111111111',
    'doc-004',
    '2,10% a.m.',
    '3,24% a.m. | 47,62% a.a.',
    'Descontos em folha e composicao da RMC com reflexo no beneficio liquido',
    'Tarifas administrativas e custos acessorios incorporados ao consignado',
    'Cobertura acessoria sem destaque suficiente sobre opcionalidade',
    'Clausula de comissao de permanencia dependente de interpretacao restritiva',
    'Multa de 2% com encargos moratorios adicionais',
    '[
      "Desconto consignado destacado em bloco tecnico de dificil leitura para o tomador",
      "Descricao pouco clara de tarifas e custos agregados",
      "Previsao de permanencia com margem para discussao sobre cumulatividade"
    ]'::jsonb,
    '[
      "Desconto consignado com potencial forte de revisao",
      "CET alto para operacao de credito consignado",
      "Tarifas acessorias e custo agregado com transparencia insuficiente"
    ]'::jsonb,
    'Desconto indevido em cartao consignado / RMC',
    'low',
    '[
      "Revisao contratual com limitacao de descontos remuneratorios",
      "Afastamento de cobrancas acessorias sem transparencia",
      "Tutela para estabilizar cobranca durante a discussao judicial"
    ]'::jsonb,
    'O consignado apresenta boa base para tese economica, com foco em desconto em folha, CET elevado e transparencia insuficiente sobre custos agregados.'
  ),
  (
    'ca-005',
    '11111111-1111-1111-1111-111111111111',
    'doc-005',
    '1,95% a.m.',
    '3,11% a.m. | 45,88% a.a.',
    'Mora contratual com risco de busca e apreensao do veiculo',
    'Cobranca acessoria e encargos vinculados a notificacao de mora',
    'Seguimento contratual dependente de leitura restritiva da clausula de garantia',
    'Comissao de permanencia a depender do entendimento do juizo',
    'Multa de 2% com encargos moratorios adicionais',
    '[
      "Notificacao de mora com indicios de concessao de prazo insuficiente",
      "Previsao de apreensao com redacao pouco acessivel ao consumidor",
      "Clausulas sobre atraso e retomada do bem com margem para discussao"
    ]'::jsonb,
    '[
      "Mora controvertida com risco de busca e apreensao",
      "Prova da posse e do uso do veiculo essencial para a defesa",
      "Notificacao com potencial de leitura restritiva"
    ]'::jsonb,
    'Mora controvertida e preservacao do veiculo',
    'medium',
    '[
      "Revisao da notificacao e da prova de mora",
      "Preservacao da posse do veiculo com tutela urgente",
      "Organizacao dos comprovantes de pagamento e do contrato de financiamento"
    ]',
    'A notificacao de mora tem base util para demonstrar a controversia sobre a busca e apreensao e a necessidade de preservar o veiculo.'
  )
on conflict (id) do update
set
  document_id = excluded.document_id,
  rate_label = excluded.rate_label,
  cet_label = excluded.cet_label,
  capitalization_label = excluded.capitalization_label,
  fees_label = excluded.fees_label,
  bundled_insurance_label = excluded.bundled_insurance_label,
  permanence_commission_label = excluded.permanence_commission_label,
  penalty_label = excluded.penalty_label,
  sensitive_clauses = excluded.sensitive_clauses,
  abusiveness_signals = excluded.abusiveness_signals,
  suggested_thesis = excluded.suggested_thesis,
  procedural_risk = excluded.procedural_risk,
  suggested_requests = excluded.suggested_requests,
  executive_summary = excluded.executive_summary,
  updated_at = timezone('utc', now());
