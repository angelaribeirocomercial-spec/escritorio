"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const avatarSize = 80;
  const viewportMargin = 16;
  const positionRef = useRef({ x: 0, y: 0 });
  const dragStateRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const claraHref = useMemo(
    () => buildClaraHref(pathname, new URLSearchParams(searchParams.toString())),
    [pathname, searchParams]
  );

  useEffect(() => {
    const initialX = Math.max(viewportMargin, window.innerWidth - avatarSize - viewportMargin);
    const initialY = Math.max(viewportMargin, window.innerHeight - avatarSize - viewportMargin);

    positionRef.current = { x: initialX, y: initialY };
    setPosition({ x: initialX, y: initialY });
  }, []);

  useEffect(() => {
    if (!isDragging) {
      return undefined;
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function onPointerMove(event: PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const nextX = clamp(
        event.clientX - dragState.offsetX,
        viewportMargin,
        window.innerWidth - avatarSize - viewportMargin
      );
      const nextY = clamp(
        event.clientY - dragState.offsetY,
        viewportMargin,
        window.innerHeight - avatarSize - viewportMargin
      );

      dragState.moved =
        dragState.moved ||
        Math.abs(nextX - positionRef.current.x) > 2 ||
        Math.abs(nextY - positionRef.current.y) > 2;
      positionRef.current = { x: nextX, y: nextY };
      setPosition({ x: nextX, y: nextY });
    }

    function endDrag(event: PointerEvent) {
      const dragState = dragStateRef.current;

      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      suppressClickRef.current = dragState.moved;
      dragStateRef.current = null;
      setIsDragging(false);

      if (suppressClickRef.current) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 150);
      }
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [isDragging]);

  return (
    <div
      className="fixed z-30"
      style={{
        left: `${position?.x ?? viewportMargin}px`,
        top: `${position?.y ?? viewportMargin}px`,
        touchAction: "none",
        visibility: position ? "visible" : "hidden"
      }}
    >
      <button
        aria-label="Abrir Clara"
        className="flex h-20 w-20 cursor-grab items-center justify-center rounded-full border border-cyan-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.96))] p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.42)] transition hover:border-cyan-200/35 active:cursor-grabbing"
        onClick={(event) => {
          if (suppressClickRef.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClickRef.current = false;
            return;
          }

          router.push(claraHref);
        }}
        onPointerDown={(event) => {
          suppressClickRef.current = false;
          dragStateRef.current = {
            pointerId: event.pointerId,
            offsetX: event.clientX - positionRef.current.x,
            offsetY: event.clientY - positionRef.current.y,
            moved: false
          };
          setIsDragging(true);
        }}
        type="button"
      >
        <ClaraAvatarGlyph />
      </button>
    </div>
  );
}
