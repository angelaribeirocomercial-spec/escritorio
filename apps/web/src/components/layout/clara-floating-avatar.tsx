"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { CLARA_GLOBAL_SEARCH_OPEN_EVENT } from "@/components/layout/workspace-global-search-events";

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

          window.dispatchEvent(new CustomEvent(CLARA_GLOBAL_SEARCH_OPEN_EVENT));
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
