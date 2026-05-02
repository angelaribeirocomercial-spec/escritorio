import { NextResponse } from "next/server";

import { getClaraIntegrations } from "@/server/services/clara/get-clara-integrations";

export async function GET() {
  const integrations = await getClaraIntegrations();

  return NextResponse.json({
    integrations
  });
}
