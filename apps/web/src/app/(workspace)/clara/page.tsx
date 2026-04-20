import Link from "next/link";

import {
  commitClaraExecutionAction,
  updateClaraRecordContentAction,
  updateClaraReviewNoteAction,
  updateClaraWorkflowStatusAction
} from "@/app/(workspace)/clara/actions";
import { ClaraRecord, listClaraRecords } from "@/server/services/clara/clara-record-store";
import {
  getClaraAgendaArtifact,
  getClaraCaseArtifact,
  getClaraClientArtifact,
  getClaraComparisonArtifact,
  getClaraDeadlineArtifact,
  getClaraProcessArtifact,
  getClaraRevisionalFilingPackageArtifact,
  getClaraTaskArtifact,
  getClaraTextDraftArtifact
} from "@/server/services/clara/get-clara-artifacts";
import { getBankingRevisionalWorkspace } from "@/server/services/clara/get-banking-revisional-workspace";
import { getClaraWorkspace } from "@/server/services/clara/get-clara-workspace";

const tabItems = [
  { id: "analise", label: "Analise" },
  { id: "revisional", label: "Revisional bancaria" },
  { id: "pecas", label: "Pecas" },
  { id: "jurisprudencia", label: "Jurisprudencia" },
  { id: "checklist", label: "Checklist" },
  { id: "proximos-passos", label: "Proximos passos" },
  { id: "comparador", label: "Comparador de documentos" }
] as const;

type TabId = (typeof tabItems)[number]["id"];

type SearchParams = {
  tab?: string;
  client?: string;
  process?: string;
  case?: string;
  document?: string;
  document2?: string;
  task?: string;
  mode?: string;
  objetivo?: string;
  action?: string;
  record?: string;
  financedAmount?: string;
  installmentCount?: string;
  contractedInstallment?: string;
  chargedInstallment?: string;
  targetReductionPercent?: string;
  history_q?: string;
  history_kind?: string;
  selected_record?: string;
};

function isTabId(value: string | undefined): value is TabId {
  return tabItems.some((item) => item.id === value);
}

function hasOptions(field: { type: string; options?: string[] }): field is { type: string; options: string[] } {
  return Array.isArray(field.options);
}

function getCustomFieldName(tab: TabId, label: string) {
  if (tab === "revisional" && label === "Objetivo") return "objetivo";
  if (tab === "comparador" && label === "Comparar por") return "mode";
  if (tab === "pecas" && label === "Tipo de peca") return "mode";
  if (tab === "checklist" && label === "Prioridade") return "mode";
  if (tab === "proximos-passos" && label === "Janela") return "mode";

  return label.toLowerCase().replace(/\s+/g, "-");
}

export default async function ClaraPage({
  searchParams
}: {
  searchParams?: SearchParams;
}) {
  const clara = await getClaraWorkspace();
  const recentRecords = await listClaraRecords(24);
  const activeTab = isTabId(searchParams?.tab) ? searchParams.tab : "analise";
  const activeWorkspace = clara.tabs[activeTab];
  const revisionalWorkspace =
    activeTab === "revisional"
      ? await getBankingRevisionalWorkspace({
          clientId: searchParams?.client,
          documentId: searchParams?.document,
          processId: searchParams?.process,
          objective: searchParams?.objetivo,
          financedAmount: searchParams?.financedAmount,
          installmentCount: searchParams?.installmentCount,
          contractedInstallment: searchParams?.contractedInstallment,
          chargedInstallment: searchParams?.chargedInstallment,
          targetReductionPercent: searchParams?.targetReductionPercent
        })
      : null;

  function getOptions(type: string) {
    if (type === "client") return clara.selectors.clients;
    if (type === "process") return clara.selectors.processes;
    if (type === "case") return clara.selectors.cases;
    if (type === "document") return clara.selectors.documents;
    if (type === "task") return clara.selectors.tasks;
    return [];
  }

  const selectedClient =
    clara.selectors.clients.find((item) => item.id === searchParams?.client) ??
    clara.selectors.clients[0];
  const selectedProcess =
    clara.selectors.processes.find((item) => item.id === searchParams?.process) ??
    clara.selectors.processes[0];
  const selectedCase =
    clara.selectors.cases.find((item) => item.id === searchParams?.case) ??
    clara.selectors.cases[0];
  const selectedDocument =
    clara.selectors.documents.find((item) => item.id === searchParams?.document) ??
    clara.selectors.documents[0];
  const selectedDocument2 =
    clara.selectors.documents.find((item) => item.id === searchParams?.document2) ??
    clara.selectors.documents[1];
  const selectedTask =
    clara.selectors.tasks.find((item) => item.id === searchParams?.task) ??
    clara.selectors.tasks[0];
  const selectedAction = searchParams?.action;
  const contextualQuickActions = [
    searchParams?.document
      ? {
          label: "Abrir motor revisional deste contrato",
          detail: "Triagem de viabilidade, abusividades, memoria de calculo e minuta inicial no mesmo fluxo.",
          href: `/clara?tab=revisional&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&action=${encodeURIComponent("Triar viabilidade revisional")}#clara-workbench`
        }
      : null,
    searchParams?.process
      ? {
          label: `Analisar ${selectedProcess.label}`,
          detail: "Leitura executiva, prazo e risco do processo atual.",
          href: `/clara?tab=analise&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&action=${encodeURIComponent("Analisar processo")}#clara-workbench`
        }
      : null,
    searchParams?.process
      ? {
          label: "Calcular prazo deste processo",
          detail: "Abre a Clara ja pronta para orientar prazo e janela util.",
          href: `/clara?tab=analise&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&action=${encodeURIComponent("Calcular prazo")}#clara-workbench`
        }
      : null,
    searchParams?.case
      ? {
          label: `Gerar minuta de ${selectedCase.label}`,
          detail: "Estrutura de peca e abertura do rascunho assistido.",
          href: `/clara?tab=pecas&case=${selectedCase.id}&document=${selectedDocument.id}&action=${encodeURIComponent("Abrir minuta assistida")}#clara-workbench`
        }
      : null,
    searchParams?.case
      ? {
          label: "Pesquisar jurisprudencia deste caso",
          detail: "Pesquisa guiada por tese e tribunal para o caso atual.",
          href: `/clara?tab=jurisprudencia&case=${selectedCase.id}&process=${selectedProcess.id}&action=${encodeURIComponent("Pesquisar precedentes")}#clara-workbench`
        }
      : null,
    searchParams?.client
      ? {
          label: `Atualizar ${selectedClient.label}`,
          detail: "Gera proxima acao e mensagem operacional ao cliente.",
          href: `/clara?tab=proximos-passos&client=${selectedClient.id}&case=${selectedCase.id}&action=${encodeURIComponent("Gerar atualizacao ao cliente")}#clara-workbench`
        }
      : null,
    searchParams?.client
      ? {
          label: "Montar proxima acao deste cliente",
          detail: "Ordena o que deve acontecer agora no fluxo do atendimento.",
          href: `/clara?tab=proximos-passos&client=${selectedClient.id}&case=${selectedCase.id}&action=${encodeURIComponent("Montar proxima acao")}#clara-workbench`
        }
      : null
  ].filter(Boolean) as { label: string; detail: string; href: string }[];

  const operationalByTab: Record<
    TabId,
    {
      title: string;
      summary: string;
      links: { label: string; href: string }[];
    }
  > = {
    analise: {
      title: "Analise pronta para aprofundamento",
      summary: `Clara cruzou ${selectedProcess.label}, ${selectedDocument.label} e ${selectedClient.label} para montar leitura executiva, prazo e risco do caso.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}` },
        { label: "Abrir documento", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir cliente", href: `/pessoas/clientes/${selectedClient.id}` }
      ]
    },
    revisional: {
      title: "Fluxo revisional pronto para execucao",
      summary: `Clara cruza ${selectedDocument.label}, ${selectedProcess.label} e ${selectedClient.label} para decidir viabilidade, abusividades, prova financeira e minuta inicial da revisional bancaria.`,
      links: [
        { label: "Abrir contrato", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir analise contratual", href: `/analise-contrato?documentId=${selectedDocument.id}` },
        { label: "Abrir editor da inicial", href: `/editor-de-texto/meus-textos?draft=1&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional` }
      ]
    },
    pecas: {
      title: "Base de peca organizada",
      summary: `Clara preparou a base de trabalho de ${selectedCase.label} usando ${selectedDocument.label}, pronta para estrutura de minuta assistida.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ver documento base", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir analise premium", href: `/analise-contrato?documentId=${selectedDocument.id}` }
      ]
    },
    jurisprudencia: {
      title: "Pesquisa orientada por tese",
      summary: `Clara preparou um recorte de pesquisa para ${selectedCase.label}, organizando o tema juridico e o tribunal alvo antes da consulta jurisprudencial.`,
      links: [
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ir para relatorios", href: "/relatorios/processos" },
        { label: "Ver processo", href: `/processos/${selectedProcess.id}` }
      ]
    },
    checklist: {
      title: "Checklist operacional montado",
      summary: `A tarefa ${selectedTask.label} foi transformada em frente operacional vinculada a ${selectedCase.label}, pronta para execucao do escritorio.`,
      links: [
        { label: "Abrir tarefa", href: `/tarefas/${selectedTask.id}` },
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Ir para tarefas", href: "/agenda/tarefas" }
      ]
    },
    "proximos-passos": {
      title: "Ordem de ataque definida",
      summary: `Clara priorizou os proximos passos de ${selectedClient.label} em torno de ${selectedCase.label}, com foco em entrega operacional e atualizacao ao cliente.`,
      links: [
        { label: "Abrir cliente", href: `/pessoas/clientes/${selectedClient.id}` },
        { label: "Abrir processo", href: `/processos/${selectedProcess.id}?case_context=1` },
        { label: "Abrir agenda", href: "/agenda/compromissos" }
      ]
    },
    comparador: {
      title: "Quadro comparativo preparado",
      summary: `Clara cruzou ${selectedDocument.label} com ${selectedDocument2.label} para localizar divergencias, reforcos de tese e pontos aproveitaveis em peca.`,
      links: [
        { label: "Abrir documento 1", href: `/documentos/${selectedDocument.id}` },
        { label: "Abrir documento 2", href: `/documentos/${selectedDocument2.id}` },
        { label: "Ir para arquivos", href: "/documentos/meus-arquivos" }
      ]
    }
  };

  const operational = operationalByTab[activeTab];
  const threadLinks = {
    "thread-1": `/clara?tab=revisional&client=${clara.selectors.clients[0]?.id ?? selectedClient.id}&process=${clara.selectors.processes[0]?.id ?? selectedProcess.id}&document=${clara.selectors.documents[0]?.id ?? selectedDocument.id}&action=${encodeURIComponent("Montar estrategia revisional")}#clara-workbench`,
    "thread-2": `/clara?tab=analise&client=${clara.selectors.clients[1]?.id ?? selectedClient.id}&process=${clara.selectors.processes[1]?.id ?? selectedProcess.id}&document=${clara.selectors.documents[1]?.id ?? selectedDocument.id}&action=${encodeURIComponent("Analisar processo")}#clara-workbench`,
    "thread-3": `/clara?tab=revisional&client=${clara.selectors.clients[2]?.id ?? selectedClient.id}&process=${clara.selectors.processes[2]?.id ?? selectedProcess.id}&document=${clara.selectors.documents[3]?.id ?? selectedDocument.id}&action=${encodeURIComponent("Triar viabilidade revisional")}#clara-workbench`
  } as const;

  const executedByTab: Record<
    TabId,
    Partial<Record<string, { title: string; body: string[]; cta: { label: string; href: string } }>>
  > = {
    analise: {
      "Analisar processo": {
        title: "Leitura executiva pronta",
        body: [
          `${selectedProcess.label} foi lido com base em ${selectedDocument.label}.`,
          "Prazo sensivel identificado na fase atual com necessidade de reforco probatorio antes da proxima peca.",
          `Cliente vinculado: ${selectedClient.label}.`
        ],
        cta: {
          label: "Abrir processo para revisar",
          href: `/processos/${selectedProcess.id}?clara=1&action=analisar-processo&document=${selectedDocument.id}&client=${selectedClient.id}`
        }
      },
      "Calcular prazo": {
        title: "Prazo operacional estimado",
        body: [
          "A Clara estimou uma janela util de preparo considerando citacao, memoria de calculo e revisao documental.",
          "O proximo passo e validar a data exata no andamento e travar checklist interno.",
          "Recomendacao: alinhar responsabilidade com a equipe antes de protocolar."
        ],
        cta: { label: "Ir para agenda", href: "/agenda/prazos?clara=1&created=1&action=calcular-prazo" }
      },
      "Gerar resumo executivo": {
        title: "Resumo executivo gerado",
        body: [
          `Caso central: ${selectedCase.label}.`,
          "Tese principal, risco, urgencia e proxima medida foram condensados em formato para repasse interno.",
          "Esse resumo ja pode orientar reuniao, atendimento ao cliente e abertura de minuta."
        ],
        cta: { label: "Abrir processo", href: `/processos/${selectedProcess.id}?clara=1&action=resumo-executivo&case_context=1` }
      }
    },
    revisional: {
      "Triar viabilidade revisional": {
        title: "Viabilidade revisional triada",
        body: [
          `${selectedDocument.label} apresenta sinais compativeis com revisional bancaria e conversa com o contexto de ${selectedClient.label}.`,
          "A Clara sugere seguir quando houver contrato, memoria de calculo basica, historico das parcelas e identificacao clara do ponto de abusividade.",
          "O caso deve priorizar clausulas remuneratorias, CET, capitalizacao, seguro embutido e encargos cumulativos."
        ],
        cta: {
          label: "Abrir analise contratual",
          href: `/analise-contrato?documentId=${selectedDocument.id}&clara=1&action=triagem-revisional&client=${selectedClient.id}&process=${selectedProcess.id}`
        }
      },
      "Mapear abusividades": {
        title: "Abusividades mapeadas",
        body: [
          "A Clara separou os sinais de abusividade mais relevantes para a narrativa revisional: juros, CET, capitalizacao, seguro embutido e cobrancas acessorias.",
          "Esse mapeamento ja serve como ponte entre leitura contratual, memoria de calculo e estrutura de fundamentos.",
          "O proximo passo e validar quais pontos entram na inicial e quais ficam como reforco probatorio."
        ],
        cta: {
          label: "Abrir comparador documental",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      },
      "Montar estrategia revisional": {
        title: "Estrategia revisional pronta",
        body: [
          `A Clara consolidou a estrategia do processo ${selectedProcess.label} com foco em rediscutir clausulas, limitar cobranca e revisar o valor das parcelas.`,
          "A ordem sugerida e: tese economica, prova documental, tutela para suspensao de excesso e memoria de calculo revisional.",
          "A estrategia ja esta pronta para virar resumo executivo, checklist e minuta inicial."
        ],
        cta: {
          label: "Abrir processo",
          href: `/processos/${selectedProcess.id}?clara=1&action=estrategia-revisional&document=${selectedDocument.id}&client=${selectedClient.id}`
        }
      },
      "Organizar provas e calculos": {
        title: "Provas e calculos organizados",
        body: [
          "A Clara converteu a revisional em frente operacional com checklist de contrato, parcelas, historico de pagamento, calculo revisional e anexos essenciais.",
          "O escritorio pode usar esse bloco para nao ajuizar sem memoria minima ou sem prova da cobranca excessiva.",
          "O resultado ja pode ser acompanhado como tarefa interna da carteira."
        ],
        cta: {
          label: "Criar tarefa revisional",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}&client=${selectedClient.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=revisional${searchParams?.objetivo ? `&objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`
        }
      },
      "Gerar minuta inicial revisional": {
        title: "Minuta inicial revisional preparada",
        body: [
          "A Clara abriu a estrutura base da acao revisional para rediscutir clausulas e readequar o valor das parcelas.",
          "A minuta sai organizada em fatos contratuais, abusividades, memoria de calculo, tutela e pedidos revisionais.",
          "A revisao humana ainda precisa definir a calibragem final dos pedidos e da estrategia probatoria."
        ],
        cta: {
          label: "Abrir editor da inicial",
          href: `/editor-de-texto/meus-textos?draft=1&created=1&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional`
        }
      }
    },
    pecas: {
      "Gerar estrutura": {
        title: "Estrutura de peca montada",
        body: [
          "A Clara separou fatos, fundamentos bancarios, pedidos e urgencia em uma ordem de redacao inicial.",
          `Documento base usado: ${selectedDocument.label}.`,
          "A revisao humana deve ajustar o enquadramento final e a dosimetria dos pedidos."
        ],
        cta: {
          label: "Abrir analise premium",
          href: `/analise-contrato?documentId=${selectedDocument.id}&clara=1&action=estrutura-peca`
        }
      },
      "Montar fundamentos": {
        title: "Fundamentos sugeridos",
        body: [
          "Foram destacados pontos de juros abusivos, capitalizacao, falha de informacao e reflexo no CET.",
          "A Clara organizou a base para encaixe de jurisprudencia e narrativa probatoria.",
          `Caso de referencia: ${selectedCase.label}.`
        ],
        cta: {
          label: "Abrir documento base",
          href: `/documentos/${selectedDocument.id}?clara=1&action=fundamentos`
        }
      },
      "Abrir minuta assistida": {
        title: "Minuta assistida pronta para revisao",
        body: [
          "A minuta inicial foi preparada em modo assistido para aprofundamento pela equipe.",
          "O texto base esta pronto para virar peticao inicial, contestacao ou manifestacao.",
          "A recomendacao e revisar pedidos urgentes antes de exportar."
        ],
        cta: {
          label: "Ir para editor de texto",
          href: `/editor-de-texto/meus-textos?draft=1&created=1&case=${selectedCase.id}&document=${selectedDocument.id}&piece=peticao-inicial`
        }
      }
    },
    jurisprudencia: {
      "Pesquisar precedentes": {
        title: "Pesquisa de precedentes organizada",
        body: [
          "A Clara preparou o recorte jurisprudencial por tema, tribunal e tipo de demanda bancaria.",
          "A busca prioriza julgados aproveitaveis na fase atual do caso.",
          `Tema em foco vinculado a ${selectedCase.label}.`
        ],
        cta: {
          label: "Abrir relatorios",
          href: "/relatorios/processos?clara=1&action=precedentes"
        }
      },
      "Separar julgados lideres": {
        title: "Julgados lideres separados",
        body: [
          "Foram destacados precedentes com maior potencial de reforco argumentativo.",
          "A recomendacao e usar os lideres para sustentar a abertura da narrativa e os pedidos centrais.",
          "Depois disso, complementar com julgados de apoio por tribunal."
        ],
        cta: { label: "Abrir processo", href: `/processos/${selectedProcess.id}?clara=1&action=julgados-lideres&case_context=1` }
      },
      "Montar base jurisprudencial": {
        title: "Base jurisprudencial pronta",
        body: [
          "A Clara organizou a base de julgados para reaproveitamento em minuta e revisao de tese.",
          "O material esta pronto para ser convertido em fundamento de peca ou resumo interno.",
          "Proximo passo: conectar a base ao documento central do caso."
        ],
        cta: {
          label: "Abrir documento",
          href: `/documentos/${selectedDocument.id}?clara=1&action=base-jurisprudencial`
        }
      }
    },
    checklist: {
      "Gerar checklist": {
        title: "Checklist operacional gerado",
        body: [
          `A tarefa ${selectedTask.label} recebeu uma lista de execucao derivada do contexto do caso.`,
          "Itens de prova, revisao e protocolo foram separados por ordem de ataque.",
          "A equipe pode usar esse checklist como trilha de execucao imediata."
        ],
        cta: {
          label: "Criar na mesa de tarefas",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}`
        }
      },
      "Reordenar execucao": {
        title: "Execucao repriorizada",
        body: [
          "A Clara reorganizou a ordem do trabalho para focar primeiro no que destrava prazo, prova e peca.",
          "Itens de manutencao ficam depois da etapa critica.",
          `Caso usado como base: ${selectedCase.label}.`
        ],
        cta: { label: "Ir para tarefas", href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}` }
      },
      "Transformar em tarefa operacional": {
        title: "Acao convertida em tarefa",
        body: [
          "A recomendacao da Clara foi preparada para virar item operacional do escritorio.",
          "O objetivo e reduzir a distancia entre insight e execucao.",
          "A revisao humana continua sendo a ultima camada antes de assumir compromisso formal."
        ],
        cta: {
          label: "Abrir tarefas",
          href: `/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}`
        }
      }
    },
    "proximos-passos": {
      "Sugerir ordem de ataque": {
        title: "Ordem de ataque pronta",
        body: [
          `Cliente priorizado: ${selectedClient.label}.`,
          "A Clara definiu agora, depois e em seguida para reduzir dispersao da equipe.",
          "O foco inicial e fechar o item que aumenta robustez do caso ou destrava a peca."
        ],
        cta: {
          label: "Abrir cliente",
          href: `/pessoas/clientes/${selectedClient.id}?clara=1&action=proximos-passos&case=${selectedCase.id}`
        }
      },
      "Montar proxima acao": {
        title: "Proxima acao definida",
        body: [
          `Caso base: ${selectedCase.label}.`,
          "A proxima entrega foi convertida em movimento operacional objetivo com criterio de prioridade.",
          "Esse passo ja pode orientar equipe, atendimento e agenda."
        ],
        cta: { label: "Abrir processo", href: `/processos/${selectedProcess.id}?clara=1&action=proxima-acao&case_context=1` }
      },
      "Gerar atualizacao ao cliente": {
        title: "Atualizacao ao cliente preparada",
        body: [
          "A Clara resumiu status, proxima medida e expectativa de andamento em linguagem de atendimento.",
          "A recomendacao e enviar apenas apos revisar o marco interno mais recente.",
          `Cliente alvo: ${selectedClient.label}.`
        ],
        cta: {
          label: "Ir para agenda",
          href: `/agenda/compromissos?clara=1&created=1&client=${selectedClient.id}&case=${selectedCase.id}`
        }
      }
    },
    comparador: {
      "Comparar documentos": {
        title: "Comparacao concluida",
        body: [
          `${selectedDocument.label} foi comparado com ${selectedDocument2.label}.`,
          "A Clara destacou divergencias de clausula, encargos e aderencia de tese.",
          "O quadro resultante pode alimentar peca, resumo ou revisao interna."
        ],
        cta: {
          label: "Abrir quadro nos arquivos",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      },
      "Apontar divergencias": {
        title: "Divergencias destacadas",
        body: [
          "Foram marcadas clausulas e sinais juridicos que diferenciam os dois documentos.",
          "A leitura ajuda a explicar excesso, incoerencia contratual ou reforco probatorio.",
          "Esse resultado e util para tese e para narrativa da peca."
        ],
        cta: {
          label: "Abrir documento 2",
          href: `/documentos/${selectedDocument2.id}?clara=1&action=comparacao`
        }
      },
      "Gerar quadro comparativo": {
        title: "Quadro comparativo montado",
        body: [
          "A Clara preparou uma visao lado a lado para reaproveitamento em analise e producao juridica.",
          "O quadro sintetiza convergencias, divergencias e impacto na tese.",
          "Proximo passo: converter isso em minuta ou fundamento."
        ],
        cta: {
          label: "Ir para arquivos",
          href: `/documentos/meus-arquivos?clara=1&created=1&document=${selectedDocument.id}&document2=${selectedDocument2.id}`
        }
      }
    }
  };

  const executedResult =
    selectedAction && executedByTab[activeTab][selectedAction]
      ? executedByTab[activeTab][selectedAction]
      : null;
  const recordKindByTab: Partial<Record<TabId, "task" | "agenda" | "deadline" | "text-draft" | "comparison" | "filing-package" | "process" | "case" | "client">> = {
    checklist: "task",
    "proximos-passos": "agenda",
    comparador: "comparison",
    revisional:
      selectedAction === "Gerar minuta inicial revisional"
        ? "text-draft"
        : selectedAction === "Montar estrategia revisional"
          ? "filing-package"
        : selectedAction === "Mapear abusividades"
          ? "comparison"
        : selectedAction === "Organizar provas e calculos"
          ? "task"
          : "process",
    pecas: selectedAction === "Abrir minuta assistida" ? "text-draft" : undefined,
    analise:
      selectedAction === "Calcular prazo"
        ? "deadline"
        : selectedAction === "Analisar processo"
          ? "process"
          : selectedAction === "Gerar resumo executivo"
            ? "case"
            : undefined
  };
  if (activeTab === "proximos-passos" && selectedAction === "Sugerir ordem de ataque") {
    recordKindByTab["proximos-passos"] = "client";
  }
  if (activeTab === "proximos-passos" && selectedAction === "Montar proxima acao") {
    recordKindByTab["proximos-passos"] = "case";
  }
  const recordKind = recordKindByTab[activeTab];
  const historyQuery = searchParams?.history_q?.trim().toLowerCase() ?? "";
  const historyKindFilter = searchParams?.history_kind?.trim() ?? "";

  function summarizeRecord(record: ClaraRecord) {
    if (record.editedTitle || record.editedDetail) {
      return {
        title: record.editedTitle || "Registro ajustado pela revisao humana",
        detail: record.editedDetail || `Ajuste manual aplicado ao registro ${record.id}`
      };
    }

    switch (record.kind) {
      case "agenda": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>;
        return {
          title: payload.clientLabel,
          detail: `${payload.statusLabel} · ${payload.caseLabel}`
        };
      }
      case "deadline": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>;
        return {
          title: payload.statusLabel,
          detail: `${payload.stageLabel} · ${payload.actionLabel}`
        };
      }
      case "task": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTaskArtifact>>;
        return {
          title: payload.title,
          detail: `${payload.statusLabel} · ${payload.caseLabel}`
        };
      }
      case "text-draft": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
        return {
          title: payload.pieceLabel,
          detail: `${payload.statusLabel} · ${payload.caseLabel}`
        };
      }
      case "comparison": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraComparisonArtifact>>;
        return {
          title: payload.firstLabel,
          detail: `${payload.statusLabel} · ${payload.secondLabel}`
        };
      }
      case "filing-package": {
        const payload =
          record.payload as Awaited<ReturnType<typeof getClaraRevisionalFilingPackageArtifact>>;
        return {
          title: payload.title,
          detail: `${payload.statusLabel} · ${payload.caseLabel}`
        };
      }
      case "process": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
        return {
          title: payload.processLabel,
          detail: `${payload.statusLabel} · ${payload.clientLabel}`
        };
      }
      case "case": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraCaseArtifact>>;
        return {
          title: payload.caseLabel,
          detail: `${payload.statusLabel} · ${payload.bankLabel}`
        };
      }
      case "client": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
        return {
          title: payload.clientLabel,
          detail: `${payload.statusLabel} · ${payload.bankLabel}`
        };
      }
    }
  }

  const filteredRecords = recentRecords.filter((record) => {
    if (historyKindFilter && record.kind !== historyKindFilter) {
      return false;
    }

    if (!historyQuery) {
      return true;
    }

    const summary = summarizeRecord(record);
    return [record.id, record.kind, record.sourceAction, summary.title, summary.detail]
      .join(" ")
      .toLowerCase()
      .includes(historyQuery);
  });
  const selectedHistoryRecord =
    filteredRecords.find((record) => record.id === searchParams?.selected_record) ??
    filteredRecords[0] ??
    null;

  const historyReturnPath = `/clara?tab=${activeTab}${
    searchParams?.history_q ? `&history_q=${encodeURIComponent(searchParams.history_q)}` : ""
  }${searchParams?.history_kind ? `&history_kind=${encodeURIComponent(searchParams.history_kind)}` : ""}${
    selectedHistoryRecord ? `&selected_record=${encodeURIComponent(selectedHistoryRecord.id)}` : ""
  }#clara-history`;

  function workflowStatusLabel(record: ClaraRecord) {
    switch (record.workflowStatus) {
      case "reviewed":
        return "Revisado";
      case "completed":
        return "Concluido";
      default:
        return "Criado";
    }
  }

  function nextWorkflowActions(record: ClaraRecord) {
    if (record.workflowStatus === "created") {
      return ["reviewed", "completed"] as const;
    }

    if (record.workflowStatus === "reviewed") {
      return ["completed", "created"] as const;
    }

    return ["reviewed", "created"] as const;
  }

  function workflowActionLabel(status: "created" | "reviewed" | "completed") {
    switch (status) {
      case "reviewed":
        return "Marcar revisado";
      case "completed":
        return "Marcar concluido";
      default:
        return "Reabrir";
    }
  }

  function detailLines(record: ClaraRecord) {
    switch (record.kind) {
      case "agenda": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraAgendaArtifact>>;
        return payload.talkingPoints;
      }
      case "deadline": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraDeadlineArtifact>>;
        return payload.steps;
      }
      case "task": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTaskArtifact>>;
        return payload.checklistPreview;
      }
      case "text-draft": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraTextDraftArtifact>>;
        return payload.sections;
      }
      case "comparison": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraComparisonArtifact>>;
        return payload.findings;
      }
      case "filing-package": {
        const payload =
          record.payload as Awaited<ReturnType<typeof getClaraRevisionalFilingPackageArtifact>>;
        return [...payload.packageItems, payload.nextStep];
      }
      case "process": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraProcessArtifact>>;
        return payload.highlights;
      }
      case "case": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraCaseArtifact>>;
        return payload.highlights;
      }
      case "client": {
        const payload = record.payload as Awaited<ReturnType<typeof getClaraClientArtifact>>;
        return payload.highlights;
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="clara-hero-shell overflow-hidden rounded-[6px] border border-white/10 bg-[linear-gradient(145deg,#0b1220,#0f1724_55%,#0b1322)] p-5 shadow-soft sm:p-6">
        <div className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-black/20 px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-sm font-semibold text-amber-300">CLARA™ — Online agora</span>
            </div>

            <h1 className="mt-5 max-w-[33rem] text-[2.3rem] font-semibold leading-[1.06] tracking-tight text-white sm:text-[3rem]">
              Conheca CLARA, sua advogada digital 24h
            </h1>
            <p className="mt-4 max-w-[31rem] text-[1rem] leading-7 text-slate-400">
              Clara trabalha dentro do fluxo real do escritorio bancario para analisar
              processos, comparar documentos, orientar prazos, sugerir pecas e transformar
              leitura juridica em proxima acao operacional.
            </p>

            <div className="mt-6 grid gap-3">
              {[
                "Analise juridica e operacional do processo",
                "Geracao assistida de pecas e minutas",
                "Pesquisa de jurisprudencia por tese bancaria",
                "Checklist e proxima acao do escritorio"
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/10 text-xs text-amber-300">
                    ✓
                  </span>
                  <p className="text-[15px] font-medium leading-6 text-slate-100">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-105"
                href={`/clara?tab=${activeTab}#clara-workbench`}
              >
                Modulo ativo: {activeWorkspace.title}
              </Link>
              <div className="clara-secondary-surface rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                Contextos ativos: {clara.metrics.contextualActions}
              </div>
            </div>
          </div>

          <article className="clara-hero-card rounded-[4px] border border-white/10 bg-[linear-gradient(180deg,#0d1725,#101b2b)] p-4 shadow-soft">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-amber-400/12 text-amber-300">
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <rect x="5" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 4.8v2.4M15 4.8v2.4M9.5 12h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-white">CLARA™</p>
                <p className="text-sm text-slate-400">Inteligencia juridica</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="clara-prompt-bubble max-w-[25rem] rounded-[4px] bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-3 text-sm font-medium text-slate-950">
                {clara.featuredResponse.prompt}
              </div>
            </div>

            <div className="clara-summary-card mt-4 max-w-[24rem] rounded-[4px] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4 text-slate-100">
              <p className="text-[15px] font-semibold leading-6 text-white">{activeWorkspace.summary}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
                {activeWorkspace.highlights.slice(0, 3).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-400">{clara.featuredResponse.cautionLabel}</p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/40" />
              <span>CLARA esta analisando o contexto do escritorio...</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="rounded-[4px] bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-105"
                href={`/clara?tab=${activeTab}#clara-workbench`}
              >
                Ir para bancada
              </Link>
              <Link
                className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                href={`/clara?tab=${activeTab}#clara-history`}
              >
                Ver historico
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Acoes Contextuais", value: clara.metrics.contextualActions },
          { label: "Modo Ativo", value: clara.metrics.activeMode },
          { label: "Respostas Hoje", value: `${clara.metrics.responsesToday}` },
          { label: "Confianca", value: clara.metrics.confidenceLabel }
        ].map((metric) => (
          <article key={metric.label} className="workspace-panel min-w-0 p-5">
            <p className="workspace-muted text-sm font-medium">{metric.label}</p>
            <p className="mt-4 break-words text-2xl font-semibold leading-tight tracking-tight text-white">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="workspace-panel p-6">
        <div className="flex flex-wrap gap-3">
          {tabItems.map((item) => {
            const active = item.id === activeTab;

            return (
                <Link
                  key={item.id}
                  className={`rounded-[4px] px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-[linear-gradient(90deg,#d9a437,#e0b04f)] text-slate-950 shadow-soft"
                    : "clara-secondary-button border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                }`}
                href={`/clara?tab=${item.id}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {activeTab === "revisional" ? (
        <section className="space-y-4">
          <div className="workspace-panel p-6">
            <p className="workspace-kicker">Fluxo revisional bancario</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                {
                  step: "01",
                  title: "Triagem",
                  detail: "Confirma contrato, parcelas, CET, encargos e viabilidade inicial da revisional."
                },
                {
                  step: "02",
                  title: "Abusividades",
                  detail: "Localiza juros, capitalizacao, seguro embutido, tarifas e clausulas sensiveis."
                },
                {
                  step: "03",
                  title: "Estrategia",
                  detail: "Define tese, pedido revisional, tutela e narrativa para rediscutir clausulas e parcelas."
                },
                {
                  step: "04",
                  title: "Prova e calculo",
                  detail: "Organiza checklist documental, memoria de calculo e anexos que sustentam a inicial."
                },
                {
                  step: "05",
                  title: "Minuta inicial",
                  detail: "Abre a peca revisional base no editor com estrutura juridica pronta para revisao."
                }
              ].map((item) => (
                <div key={item.step} className="clara-secondary-surface rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">{item.step}</p>
                  <p className="mt-3 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {revisionalWorkspace ? (
            <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
              <article className="workspace-panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="workspace-kicker">Leitura contratual estruturada</p>
                    <p className="mt-3 text-lg font-semibold text-white">
                      {revisionalWorkspace.selectedDocument.fileName}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {revisionalWorkspace.analysis.executiveSummary}
                    </p>
                    <p className="mt-3 text-sm font-medium text-amber-200">
                      Cenario: {revisionalWorkspace.scenarioProfile.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {revisionalWorkspace.scenarioProfile.summary}
                    </p>
                    <p className="mt-3 text-sm font-medium text-emerald-200">
                      Produto bancario: {revisionalWorkspace.productProfile.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {revisionalWorkspace.productProfile.strategyDriver}
                    </p>
                    <p className="mt-3 text-sm font-medium text-cyan-200">
                      Objetivo atual: {revisionalWorkspace.objectiveProfile.label}
                    </p>
                    <p className="mt-3 text-sm font-medium text-fuchsia-200">
                      Chave de urgencia: {revisionalWorkspace.urgencyProfile.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {revisionalWorkspace.urgencyProfile.summary}
                    </p>
                  </div>
                  <div className="clara-secondary-surface rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Viabilidade
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {revisionalWorkspace.viabilityScore}%
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Risco {revisionalWorkspace.riskLabel.toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {revisionalWorkspace.clauseMap.map((item) => (
                    <div key={item.title} className="workspace-soft-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.title}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">{item.detail}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.impact}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {revisionalWorkspace.legalGrounds.map((item) => (
                    <div key={item.title} className="workspace-soft-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-[4px] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    Direcao decisoria da Clara
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50">
                    {revisionalWorkspace.decisionSummary}
                  </p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {revisionalWorkspace.priorityTheses.map((item) => (
                    <div key={item.title} className="workspace-soft-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Tese priorizada
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.rationale}</p>
                      <p className="mt-3 text-xs text-slate-400">Prova-chave: {item.proof}</p>
                      <p className="mt-1 text-xs text-slate-400">Pedido conectado: {item.request}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="space-y-4">
                <div className="workspace-panel p-6">
                  <p className="workspace-kicker">Sinais de abusividade</p>
                  <div className="mt-4 space-y-3">
                    {revisionalWorkspace.analysis.abusivenessSignals.map((item) => (
                      <div
                        key={item}
                        className="rounded-[4px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="workspace-panel p-6">
                  <p className="workspace-kicker">Prova e calculo minimo</p>
                  <div className="mt-4 space-y-3">
                    {revisionalWorkspace.missingEvidence.map((item) => (
                      <div key={item} className="workspace-soft-card p-4">
                        <p className="text-sm leading-6 text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3">
                    {revisionalWorkspace.evidenceTracks.map((track) => (
                      <div key={track.title} className="workspace-soft-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {track.title}
                        </p>
                        <div className="mt-3 space-y-2">
                          {track.items.map((item) => (
                            <p key={item} className="text-sm leading-6 text-slate-200">
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Driver do produto bancario
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {revisionalWorkspace.productProfile.thesisDriver}
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {revisionalWorkspace.criticalProof.map((item) => (
                      <div
                        key={item}
                        className="rounded-[4px] border border-emerald-300/15 bg-emerald-300/10 px-4 py-4 text-sm leading-6 text-emerald-100"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Prontidao documental
                    </p>
                    <div className="mt-3 space-y-3">
                      {revisionalWorkspace.documentReadiness.map((item) => (
                        <div key={item.title} className="workspace-soft-card p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <span
                              className={`rounded-[4px] border px-2 py-1 text-[11px] font-semibold ${
                                item.status === "ok"
                                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                  : item.status === "warning"
                                    ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                                    : "border-fuchsia-300/20 bg-fuchsia-300/10 text-fuchsia-100"
                              }`}
                            >
                              {item.status === "ok"
                                ? "OK"
                                : item.status === "warning"
                                  ? "Pendencia"
                                  : "Falta"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ) : null}

          {revisionalWorkspace ? (
            <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
              <article className="workspace-panel p-6">
                <p className="workspace-kicker">Estrategia revisional</p>
                <div className="mt-4 space-y-3">
                  {revisionalWorkspace.strategySteps.map((item, index) => (
                    <div key={item} className="workspace-soft-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Passo {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[4px] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">
                    Leitura orientada pelo objetivo
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cyan-100">
                    {revisionalWorkspace.objectiveProfile.strategyFocus}
                  </p>
                </div>
                <div className="mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Checklist de ajuizamento
                  </p>
                  <div className="mt-3 space-y-3">
                    {revisionalWorkspace.filingChecklist.map((item) => (
                      <div key={item.title} className="workspace-soft-card p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <span
                            className={`rounded-[4px] border px-2 py-1 text-[11px] font-semibold ${
                              item.status === "ready"
                                ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                                : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                            }`}
                          >
                            {item.status === "ready" ? "Pronto" : "Atencao"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-[4px] border border-amber-300/20 bg-amber-300/10 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-100">
                    {revisionalWorkspace.filingPackage.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-50">
                    {revisionalWorkspace.filingPackage.summary}
                  </p>
                <div className="mt-3 space-y-3">
                  {revisionalWorkspace.filingPackage.items.map((item) => (
                    <div key={item.kind} className="workspace-soft-card p-4">
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                    href={`/agenda/tarefas?clara=1&created=1&task=${selectedTask.id}&case=${selectedCase.id}&client=${selectedClient.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=revisional&objetivo=${encodeURIComponent(revisionalWorkspace.objectiveProfile.label)}`}
                  >
                    Abrir tarefa do pacote
                  </Link>
                  <Link
                    className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                    href={`/agenda/compromissos?clara=1&created=1&client=${selectedClient.id}&case=${selectedCase.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=revisional&objetivo=${encodeURIComponent(revisionalWorkspace.objectiveProfile.label)}`}
                  >
                    Abrir compromisso do pacote
                  </Link>
                  <Link
                    className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                    href={`/editor-de-texto/meus-textos?draft=1&created=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional&objetivo=${encodeURIComponent(revisionalWorkspace.objectiveProfile.label)}&contractedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.contractedInstallment)}&chargedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.chargedInstallment)}&revisedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.revisedInstallment)}&estimatedTotalExcess=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.estimatedTotalExcess)}`}
                  >
                    Abrir minuta do pacote
                  </Link>
                </div>
                {
                  // @ts-expect-error Next server action form binding
                  <form action={commitClaraExecutionAction} className="mt-3">
                    <input name="targetPath" type="hidden" value={`/clara?tab=revisional&client=${selectedClient.id}&process=${selectedProcess.id}&document=${selectedDocument.id}${searchParams?.objetivo ? `&objetivo=${encodeURIComponent(searchParams.objetivo)}` : ""}`} />
                    <input name="recordKind" type="hidden" value="filing-package" />
                    <input name="sourceAction" type="hidden" value="Montar estrategia revisional" />
                    <input name="client" type="hidden" value={selectedClient.id} />
                    <input name="case" type="hidden" value={selectedCase.id} />
                    <input name="document" type="hidden" value={selectedDocument.id} />
                    <input name="process" type="hidden" value={selectedProcess.id} />
                    <input name="objective" type="hidden" value={revisionalWorkspace.objectiveProfile.label} />
                    <button
                      className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      type="submit"
                    >
                      Salvar pacote no historico
                    </button>
                  </form>
                }
              </div>
              </article>

              <article className="workspace-panel p-6">
                <p className="workspace-kicker">Frente de calculo e minuta</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Calculo revisional</p>
                    <form className="mt-3 grid gap-3" method="get">
                      <input name="tab" type="hidden" value={activeTab} />
                      <input name="client" type="hidden" value={selectedClient.id} />
                      <input name="process" type="hidden" value={selectedProcess.id} />
                      <input name="document" type="hidden" value={selectedDocument.id} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Valor financiado
                          </label>
                          <input
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            defaultValue={revisionalWorkspace.calculationMemory.labels.financedAmount}
                            name="financedAmount"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Quantidade de parcelas
                          </label>
                          <input
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            defaultValue={revisionalWorkspace.calculationMemory.inputs.installmentCount}
                            name="installmentCount"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Parcela contratada
                          </label>
                          <input
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            defaultValue={revisionalWorkspace.calculationMemory.labels.contractedInstallment}
                            name="contractedInstallment"
                            type="text"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Parcela cobrada
                          </label>
                          <input
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            defaultValue={revisionalWorkspace.calculationMemory.labels.chargedInstallment}
                            name="chargedInstallment"
                            type="text"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Reducao alvo da parcela (%)
                          </label>
                          <input
                            className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                            defaultValue={revisionalWorkspace.calculationMemory.inputs.targetReductionPercent}
                            name="targetReductionPercent"
                            step="0.1"
                            type="number"
                          />
                        </div>
                      </div>
                      <button
                        className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                        type="submit"
                      >
                        Recalcular memoria revisional
                      </button>
                    </form>
                    <div className="mt-3 grid gap-3">
                      {[
                        {
                          label: "Parcela contratada",
                          value: revisionalWorkspace.calculationMemory.labels.contractedInstallment
                        },
                        {
                          label: "Parcela cobrada",
                          value: revisionalWorkspace.calculationMemory.labels.chargedInstallment
                        },
                        {
                          label: "Parcela revisada",
                          value: revisionalWorkspace.calculationMemory.labels.revisedInstallment
                        },
                        {
                          label: "Excesso mensal",
                          value: revisionalWorkspace.calculationMemory.labels.estimatedMonthlyExcess
                        },
                        {
                          label: "Excesso estimado",
                          value: revisionalWorkspace.calculationMemory.labels.estimatedTotalExcess
                        }
                      ].map((item) => (
                        <div key={item.label} className="workspace-soft-card p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.label}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-3">
                      {revisionalWorkspace.calculationFront.map((item) => (
                        <div key={item} className="workspace-soft-card p-4">
                          <p className="text-sm leading-6 text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-[4px] border border-cyan-300/15 bg-cyan-300/10 px-4 py-4">
                      <p className="text-sm leading-6 text-cyan-100">
                        {revisionalWorkspace.calculationMemory.basis}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Estrutura da inicial</p>
                    <div className="mt-3 space-y-3">
                      {revisionalWorkspace.initialStructure.map((item) => (
                        <div key={item} className="workspace-soft-card p-4">
                          <p className="text-sm leading-6 text-slate-200">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-3">
                      {revisionalWorkspace.calculationMemory.highlights.map((item) => (
                        <div
                          key={item}
                          className="rounded-[4px] border border-amber-300/20 bg-amber-300/10 px-4 py-4 text-sm leading-6 text-amber-100"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 space-y-3">
                      {revisionalWorkspace.petitionRequests.map((item) => (
                        <div key={item.title} className="workspace-soft-card p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            {item.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-200">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      className="mt-3 inline-flex rounded-[4px] bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                      href={`/editor-de-texto/meus-textos?draft=1&created=1&case=${selectedCase.id}&process=${selectedProcess.id}&client=${selectedClient.id}&document=${selectedDocument.id}&piece=acao-revisional&objetivo=${encodeURIComponent(revisionalWorkspace.objectiveProfile.label)}&contractedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.contractedInstallment)}&chargedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.chargedInstallment)}&revisedInstallment=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.revisedInstallment)}&estimatedTotalExcess=${encodeURIComponent(revisionalWorkspace.calculationMemory.labels.estimatedTotalExcess)}`}
                    >
                      Abrir minuta com memoria revisional
                    </Link>
                    <Link
                      className="mt-3 inline-flex rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                      href={`/agenda/compromissos?clara=1&created=1&client=${selectedClient.id}&case=${selectedCase.id}&process=${selectedProcess.id}&document=${selectedDocument.id}&focus=revisional&objetivo=${encodeURIComponent(revisionalWorkspace.objectiveProfile.label)}`}
                    >
                      Preparar retorno ao cliente
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ) : null}
        </section>
      ) : null}

      {contextualQuickActions.length ? (
        <section className="workspace-panel p-6">
          <p className="workspace-kicker">Acoes rapidas do objeto atual</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {contextualQuickActions.map((item) => (
              <Link
                key={item.href}
                className="clara-secondary-surface rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-4 transition hover:bg-white/[0.08]"
                href={item.href}
              >
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <article className="workspace-panel p-6">
          <p className="workspace-kicker">{activeWorkspace.title}</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{activeWorkspace.subtitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">{activeWorkspace.summary}</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {activeWorkspace.cards.map((card) => (
              <div key={card.label} className="workspace-soft-card p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-3 text-base font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="workspace-panel p-6" id="clara-workbench">
          <p className="workspace-kicker">Bancada de trabalho</p>
          <form className="clara-secondary-surface mt-4 rounded-[4px] border border-white/10 bg-white/[0.04] p-5" method="get">
            <input name="tab" type="hidden" value={activeTab} />
            <div className="grid gap-4 md:grid-cols-3">
              {activeWorkspace.workflow.fields.map((field, index) => {
                const name =
                  field.type === "document" && activeTab === "comparador" && index === 1
                    ? "document2"
                    : field.type;

                return (
                  <div key={`${field.label}-${name}`}>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {field.label}
                    </label>
                  {field.type === "custom" && hasOptions(field) ? (
                    <select className="reference-search-input w-full px-3 py-2 text-sm outline-none" name={getCustomFieldName(activeTab, field.label)}>
                      {field.options.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                      </select>
                    ) : (
                      <select className="reference-search-input w-full px-3 py-2 text-sm outline-none" name={name}>
                        {getOptions(field.type).map((option) => (
                          <option key={option.id} selected={(searchParams as Record<string, string | undefined> | undefined)?.[name] === option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {activeWorkspace.workflow.actions.map((action, index) => (
                <button
                  key={action}
                  className={`rounded-[4px] px-4 py-3 text-sm font-semibold ${
                    index === 0
                      ? "bg-[linear-gradient(90deg,#d9a437,#e0b04f)] text-slate-950 shadow-soft"
                      : "clara-secondary-button border border-white/10 bg-white/[0.04] text-slate-100"
                  }`}
                  name="action"
                  type="submit"
                  value={action}
                >
                  {action}
                </button>
              ))}
            </div>
          </form>

          <div className="clara-secondary-surface mt-6 rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <p className="workspace-kicker">Saida operacional</p>
            <p className="mt-3 text-lg font-semibold text-white">{operational.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{operational.summary}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {operational.links.map((link) => (
                <Link
                  key={link.label}
                  className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {executedResult ? (
            <div className="mt-5 rounded-[4px] border border-amber-300/20 bg-amber-300/10 p-5">
              <p className="workspace-kicker">Execucao da Clara</p>
              <p className="mt-3 text-lg font-semibold text-white">{executedResult.title}</p>
              <div className="mt-4 space-y-2">
                {executedResult.body.map((line) => (
                  <p key={line} className="text-sm leading-7 text-slate-200">
                    {line}
                  </p>
                ))}
              </div>
              <Link
                className="mt-5 inline-flex rounded-[4px] bg-[linear-gradient(90deg,#d9a437,#e0b04f)] px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft"
                href={executedResult.cta.href}
              >
                {executedResult.cta.label}
              </Link>
              {recordKind ? (
                // @ts-expect-error Next server action form binding
                <form action={commitClaraExecutionAction} className="mt-3">
                  <input name="targetPath" type="hidden" value={executedResult.cta.href} />
                  <input name="recordKind" type="hidden" value={recordKind} />
                  <input name="sourceAction" type="hidden" value={selectedAction} />
                  <input name="client" type="hidden" value={selectedClient.id} />
                  <input name="case" type="hidden" value={selectedCase.id} />
                  <input name="document" type="hidden" value={selectedDocument.id} />
                  <input name="document2" type="hidden" value={selectedDocument2.id} />
                  <input name="process" type="hidden" value={selectedProcess.id} />
                  <input name="task" type="hidden" value={selectedTask.id} />
                  <input name="piece" type="hidden" value="peticao-inicial" />
                  <input name="deadlineAction" type="hidden" value={selectedAction} />
                  <input name="focus" type="hidden" value={activeTab === "revisional" && selectedAction === "Organizar provas e calculos" ? "revisional" : ""} />
                  <input name="objective" type="hidden" value={searchParams?.objetivo ?? ""} />
                  <button
                    className="clara-secondary-button inline-flex rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                    type="submit"
                  >
                    Criar registro no ERP
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          <div className="clara-secondary-surface mt-5 rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Highlights da Clara
            </p>
            <div className="mt-4 space-y-3">
              {activeWorkspace.highlights.map((item) => (
                <div key={item} className="workspace-soft-card p-4">
                  <p className="text-sm leading-7 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="clara-secondary-surface mt-5 rounded-[4px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Threads recentes
            </p>
            <div className="mt-4 space-y-3">
              {clara.recentThreads.map((thread) => (
                <Link
                  key={thread.id}
                  className="clara-tertiary-surface block rounded-[4px] border border-white/10 bg-black/20 px-4 py-4 transition hover:bg-white/[0.06]"
                  href={threadLinks[thread.id as keyof typeof threadLinks] ?? `/clara?tab=${activeTab}#clara-workbench`}
                >
                  <p className="text-sm font-semibold text-white">{thread.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{thread.detail}</p>
                </Link>
              ))}
            </div>
          </div>

          <div
            className="clara-secondary-surface mt-5 rounded-[4px] border border-white/10 bg-white/[0.04] p-5"
            id="clara-history"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Historico da Clara
              </p>
              <span className="text-xs text-slate-500">{filteredRecords.length} registro(s)</span>
            </div>
            <form className="mt-4 grid gap-3 md:grid-cols-[1fr_12rem_auto]" method="get">
              <input name="tab" type="hidden" value={activeTab} />
              <input
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                defaultValue={searchParams?.history_q ?? ""}
                name="history_q"
                placeholder="Buscar por id, acao ou contexto"
                type="search"
              />
              <select
                className="reference-search-input w-full px-3 py-2 text-sm outline-none"
                defaultValue={historyKindFilter}
                name="history_kind"
              >
                <option value="">Todos os tipos</option>
                <option value="agenda">Agenda</option>
                <option value="deadline">Prazos</option>
                <option value="task">Tarefas</option>
                <option value="text-draft">Minutas</option>
                <option value="comparison">Comparacoes</option>
                <option value="filing-package">Pacotes</option>
                <option value="process">Processos</option>
                <option value="case">Casos</option>
                <option value="client">Clientes</option>
              </select>
              <button
                className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                type="submit"
              >
                Filtrar
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {filteredRecords.length ? (
                filteredRecords.map((record) => {
                  const summary = summarizeRecord(record);

                  return (
                    <div key={record.id}>
                      <Link
                        className="clara-tertiary-surface block rounded-[4px] border border-white/10 bg-black/20 px-4 py-4 transition hover:bg-white/[0.06]"
                        href={`/clara?tab=${activeTab}${searchParams?.history_q ? `&history_q=${encodeURIComponent(searchParams.history_q)}` : ""}${searchParams?.history_kind ? `&history_kind=${encodeURIComponent(searchParams.history_kind)}` : ""}&selected_record=${record.id}#clara-history`}
                      >
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                          <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                            {record.kind}
                          </span>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-slate-300">
                            {workflowStatusLabel(record)}
                          </span>
                          <span>{record.id}</span>
                          <span>{new Date(record.createdAt).toLocaleString("pt-BR")}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-white">{summary.title}</p>
                        <p className="mt-2 text-sm text-slate-300">{summary.detail}</p>
                        <p className="mt-2 text-xs text-slate-500">Acao: {record.sourceAction}</p>
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {nextWorkflowActions(record).map((status) => (
                          // @ts-expect-error Next server action form binding
                          <form action={updateClaraWorkflowStatusAction} key={status}>
                            <input name="recordId" type="hidden" value={record.id} />
                            <input name="workflowStatus" type="hidden" value={status} />
                            <input name="returnPath" type="hidden" value={historyReturnPath} />
                            <button
                              className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                              type="submit"
                            >
                              {workflowActionLabel(status)}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="clara-tertiary-surface rounded-[4px] border border-white/10 bg-black/20 px-4 py-4 text-sm text-slate-400">
                  Nenhum registro da Clara foi criado ainda.
                </div>
              )}
            </div>
            {selectedHistoryRecord ? (
              <div className="clara-tertiary-surface mt-5 rounded-[4px] border border-white/10 bg-black/20 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Revisao do registro
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {summarizeRecord(selectedHistoryRecord).title}
                    </p>
                  </div>
                  <Link
                    className="clara-secondary-button rounded-[4px] border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.1]"
                    href={`${selectedHistoryRecord.targetPath}${selectedHistoryRecord.targetPath.includes("?") ? "&" : "?"}record=${selectedHistoryRecord.id}`}
                  >
                    Abrir no ERP
                  </Link>
                </div>
                <div className="mt-4 space-y-2">
                  {detailLines(selectedHistoryRecord).map((line) => (
                    <p key={line} className="text-sm leading-7 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
                {
                  // @ts-expect-error Next server action form binding
                  <form action={updateClaraRecordContentAction} className="mt-4">
                    <input name="recordId" type="hidden" value={selectedHistoryRecord.id} />
                    <input name="returnPath" type="hidden" value={historyReturnPath} />
                    <div className="grid gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Titulo revisado
                        </label>
                        <input
                          className="reference-search-input w-full px-3 py-3 text-sm outline-none"
                          defaultValue={selectedHistoryRecord.editedTitle ?? summarizeRecord(selectedHistoryRecord).title}
                          name="editedTitle"
                          placeholder="Ajuste o titulo final do registro"
                          type="text"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Resumo revisado
                        </label>
                        <textarea
                          className="reference-search-input min-h-[6.5rem] w-full px-3 py-3 text-sm outline-none"
                          defaultValue={selectedHistoryRecord.editedDetail ?? summarizeRecord(selectedHistoryRecord).detail}
                          name="editedDetail"
                          placeholder="Consolide aqui a versao final revisada pelo advogado."
                        />
                      </div>
                    </div>
                    <button
                      className="clara-secondary-button mt-3 rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      type="submit"
                    >
                      Salvar conteudo revisado
                    </button>
                  </form>
                }
                <p className="mt-4 text-xs text-slate-500">
                  Ultima atualizacao: {new Date(selectedHistoryRecord.updatedAt).toLocaleString("pt-BR")}
                </p>
                {
                  // @ts-expect-error Next server action form binding
                  <form action={updateClaraReviewNoteAction} className="mt-4">
                    <input name="recordId" type="hidden" value={selectedHistoryRecord.id} />
                    <input name="returnPath" type="hidden" value={historyReturnPath} />
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Observacao da revisao humana
                    </label>
                    <textarea
                      className="reference-search-input min-h-[7rem] w-full px-3 py-3 text-sm outline-none"
                      defaultValue={selectedHistoryRecord.reviewNote ?? ""}
                      name="reviewNote"
                      placeholder="Registre ajuste, cautela juridica, pendencia ou validacao humana."
                    />
                    <button
                      className="clara-secondary-button mt-3 rounded-[4px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
                      type="submit"
                    >
                      Salvar observacao
                    </button>
                  </form>
                }
              </div>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
