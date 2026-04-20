import { redirect } from "next/navigation";

export default function TarefasRedirectPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  redirect(query ? `/agenda/tarefas?${query}` : "/agenda/tarefas");
}
