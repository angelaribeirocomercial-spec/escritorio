import { NextResponse } from "next/server";

import { mapClaraApiError } from "@/app/api/clara/_shared";
import {
  crmChatbotIntakeSchema,
  normalizeCrmChatbotIntake
} from "@/server/services/crm/chatbot-intake";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = crmChatbotIntakeSchema.parse(body);
    const data = normalizeCrmChatbotIntake(payload);

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error) {
    return mapClaraApiError(error);
  }
}
