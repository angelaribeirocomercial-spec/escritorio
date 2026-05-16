import { NextRequest, NextResponse } from "next/server";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import {
  getClaraChatThread,
  sendClaraChatMessage
} from "@/server/services/clara/clara-chat-service";
import type {
  ClaraChatRouteRequest,
  ClaraChatRouteResponse,
  ClaraChatThreadSource
} from "@/server/services/clara/clara-chat-types";

function readContextFromSearchParams(searchParams: URLSearchParams) {
  const source: ClaraChatThreadSource =
    searchParams.get("source") === "workspace" ? "workspace" : "dossie";

  return {
    clientId: searchParams.get("clientId") ?? "",
    caseId: searchParams.get("caseId") ?? "",
    processId: searchParams.get("processId") ?? undefined,
    documentId: searchParams.get("documentId") ?? undefined,
    source
  };
}

export async function GET(request: NextRequest) {
  try {
    const context = readContextFromSearchParams(request.nextUrl.searchParams);
    const thread = await getClaraChatThread(context);

    return NextResponse.json({
      ok: true,
      data: {
        threadId: thread.id,
        messages: thread.messages
      }
    } satisfies ClaraChatRouteResponse);
  } catch (error) {
    return mapClaraApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ClaraChatRouteRequest;
    const result = await sendClaraChatMessage({
      threadId: body.threadId,
      context: {
        clientId: body.clientId,
        caseId: body.caseId,
        processId: body.processId,
        documentId: body.documentId,
        source: body.source
      },
      message: body.message
    });

    return NextResponse.json({
      ok: true,
      data: {
        threadId: result.thread.id,
        messages: result.thread.messages,
        resolution: result.resolution
      }
    } satisfies ClaraChatRouteResponse);
  } catch (error) {
    return mapClaraApiError(error);
  }
}
