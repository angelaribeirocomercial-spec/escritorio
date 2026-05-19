"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getDemoClaraFirstHref } from "@/lib/auth/demo-entry";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const signInSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
});

export type SignInState = {
  error?: string;
};

export async function signInAction(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Nao foi possivel validar o login."
    };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error: "Nao foi possivel autenticar. Revise as credenciais e tente novamente."
    };
  }

  redirect(getDemoClaraFirstHref());
}

export async function signOutAction() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
