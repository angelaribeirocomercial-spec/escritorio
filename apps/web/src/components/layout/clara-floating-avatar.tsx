"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function buildClaraHref(pathname: string, searchParams: URLSearchParams) {
  const routeParts = pathname.split("/").filter(Boolean);
  const params = new URLSearchParams();

  const clientFromQuery = searchParams.get("client") ?? searchParams.get("clientId");
  const caseFromQuery = searchParams.get("case") ?? searchParams.get("caseId");
  const processFromQuery = searchParams.get("process") ?? searchParams.get("processId");
  const documentFromQuery = searchParams.get("document") ?? searchParams.get("documentId");
  const taskFromQuery = searchParams.get("task");

  if (pathname.startsWith("/pessoas/clientes/") && routeParts[2]) {
    params.set("client", routeParts[2]);
  } else if (clientFromQuery) {
    params.set("client", clientFromQuery);
  }

  if (caseFromQuery) {
    params.set("case", caseFromQuery);
  }

  if (pathname.startsWith("/processos/") && routeParts[1] && routeParts[1] !== "modelo") {
    params.set("process", routeParts[1]);
  } else if (processFromQuery) {
    params.set("process", processFromQuery);
  }

  if (pathname.startsWith("/documentos/") && routeParts[1] && routeParts[1] !== "enviar-arquivos") {
    params.set("document", routeParts[1]);
  } else if (documentFromQuery) {
    params.set("document", documentFromQuery);
  }

  if (taskFromQuery) {
    params.set("task", taskFromQuery);
  }

  if (!params.has("tab")) {
    params.set("tab", "analise");
  }

  const queryString = params.toString();
  return queryString ? `/clara?${queryString}` : "/clara";
}

function ClaraAvatarGlyph() {
  return (
    <div className="relative h-16 w-16 overflow-hidden rounded-full border border-cyan-200/30 bg-[radial-gradient(circle_at_35%_30%,rgba(248,250,252,0.95),rgba(125,211,252,0.3)_45%,rgba(15,23,42,0.95)_100%)] shadow-[0_18px_45px_rgba(8,145,178,0.28)]">
      <Image
        alt="Avatar da Clara"
        className="object-cover object-[center_14%]"
        fill
        priority
        sizes="64px"
        src="/clara/avatar.png"
      />
    </div>
  );
}

export function ClaraFloatingAvatar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const claraHref = useMemo(
    () => buildClaraHref(pathname, new URLSearchParams(searchParams.toString())),
    [pathname, searchParams]
  );

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-30 flex max-w-[calc(100vw-2rem)] items-end justify-end lg:bottom-6 lg:right-6">
      <Link
        aria-label="Abrir Clara"
        className="pointer-events-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96))] p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.42)] transition hover:-translate-y-0.5 hover:border-cyan-200/35"
        href={claraHref}
      >
        <ClaraAvatarGlyph />
      </Link>
    </div>
  );
}
