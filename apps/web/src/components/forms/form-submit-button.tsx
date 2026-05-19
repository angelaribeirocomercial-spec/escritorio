"use client";

import { useState } from "react";

export function FormSubmitButton({
  children,
  className = "",
  pendingLabel = "Enviando..."
}: {
  children: string;
  className?: string;
  pendingLabel?: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <button
      className={className}
      type="submit"
      aria-disabled={pending}
      disabled={pending}
      onClick={(event) => {
        const form = event.currentTarget.form;

        if (form && !form.checkValidity()) {
          return;
        }

        setPending(true);
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
