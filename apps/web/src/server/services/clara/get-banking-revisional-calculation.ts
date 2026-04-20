type CalculationInput = {
  financedAmount?: string;
  installmentCount?: string;
  contractedInstallment?: string;
  chargedInstallment?: string;
  targetReductionPercent?: string;
};

function parseCurrency(value: string | undefined, fallback: number) {
  if (!value?.trim()) {
    return fallback;
  }

  const normalized = value
    .replace(/[R$\s.]/g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1).replace(".", ",")}%`;
}

export function getBankingRevisionalCalculation(
  input: CalculationInput | undefined,
  fallback: {
    financedAmount: number;
    installmentCount: number;
    contractedInstallment: number;
    chargedInstallment: number;
    targetReductionPercent: number;
    basis: string;
  }
) {
  const financedAmount = parseCurrency(input?.financedAmount, fallback.financedAmount);
  const installmentCount = parseInteger(input?.installmentCount, fallback.installmentCount);
  const contractedInstallment = parseCurrency(
    input?.contractedInstallment,
    fallback.contractedInstallment
  );
  const chargedInstallment = parseCurrency(input?.chargedInstallment, fallback.chargedInstallment);
  const targetReductionPercent = parseCurrency(
    input?.targetReductionPercent,
    fallback.targetReductionPercent
  );

  const revisedInstallment = Math.max(
    chargedInstallment * (1 - targetReductionPercent / 100),
    0
  );
  const estimatedMonthlyExcess = Math.max(chargedInstallment - revisedInstallment, 0);
  const estimatedTotalExcess = estimatedMonthlyExcess * installmentCount;
  const contractedGap = Math.max(chargedInstallment - contractedInstallment, 0);

  return {
    inputs: {
      financedAmount,
      installmentCount,
      contractedInstallment,
      chargedInstallment,
      targetReductionPercent
    },
    labels: {
      financedAmount: formatCurrency(financedAmount),
      installmentCount: `${installmentCount} parcelas`,
      contractedInstallment: formatCurrency(contractedInstallment),
      chargedInstallment: formatCurrency(chargedInstallment),
      revisedInstallment: formatCurrency(revisedInstallment),
      estimatedMonthlyExcess: formatCurrency(estimatedMonthlyExcess),
      estimatedTotalExcess: formatCurrency(estimatedTotalExcess),
      targetReductionPercent: formatPercent(targetReductionPercent),
      contractedGap: formatCurrency(contractedGap)
    },
    basis:
      `${fallback.basis} Simulacao atual considera reducao alvo de ${formatPercent(targetReductionPercent)} sobre a parcela cobrada, em ${installmentCount} parcelas, para orientar a narrativa economica inicial.`,
    highlights: [
      `Reducao alvo aplicada: ${formatPercent(targetReductionPercent)} na parcela cobrada.`,
      `Excesso mensal estimado em ${formatCurrency(estimatedMonthlyExcess)} frente a uma parcela revisada de ${formatCurrency(revisedInstallment)}.`,
      `Excesso acumulado estimado em ${formatCurrency(estimatedTotalExcess)} ao longo de ${installmentCount} parcelas.`
    ]
  };
}
