import { redirect } from "next/navigation";

export default function ClienteRedirectPage({
  params,
  searchParams
}: {
  params: { clientId: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const paramsOut = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => paramsOut.append(key, entry));
      return;
    }

    if (typeof value === "string") {
      paramsOut.set(key, value);
    }
  });

  const query = paramsOut.toString();
  redirect(query ? `/pessoas/clientes/${params.clientId}?${query}` : `/pessoas/clientes/${params.clientId}`);
}
