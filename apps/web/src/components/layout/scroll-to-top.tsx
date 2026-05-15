"use client";

import { useEffect } from "react";

type ScrollToTopProps = {
  behavior?: ScrollBehavior;
};

export function ScrollToTop({ behavior = "auto" }: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [behavior]);

  return null;
}
