import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.")
});

function redirectWithError(request: NextRequest, message: string) {
  const url = new URL("/sign-in", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return redirectWithError(
      request,
      parsed.error.issues[0]?.message ?? "Nao foi possivel validar o login."
    );
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return redirectWithError(
      request,
      "Nao foi possivel autenticar. Revise as credenciais e tente novamente."
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
