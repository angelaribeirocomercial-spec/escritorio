import { NextRequest, NextResponse } from "next/server";

import { listClaraRecords } from "@/server/services/clara/clara-record-store";
import { listClaraExecutionLogs } from "@/server/services/clara/get-clara-contextual-analysis";

function parseLimit(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return 12;
  }

  return Math.min(parsed, 50);
}

export async function GET(request: NextRequest) {
  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));
  const [records, executions] = await Promise.all([
    listClaraRecords(limit),
    listClaraExecutionLogs(limit)
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      limit,
      records,
      executions,
      summary: `Historico da Clara com ${records.length} registro(s) e ${executions.length} execucao(oes).`
    }
  });
}
