"use client";

import { useActionState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { initialActionState, type ActionState } from "@/lib/form";
import { SubmitButton } from "@/components/submit-button";

type FormAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Menyimpan…",
  submitClassName = "btn-primary",
  className,
  notice,
}: {
  action: FormAction;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  submitClassName?: string;
  className?: string;
  notice?: ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  const fieldMessages = state.fieldErrors
    ? Object.entries(state.fieldErrors).flatMap(([field, messages]) =>
        messages.map((message) => ({ field, message })),
      )
    : [];

  return (
    <form action={formAction} className={className} noValidate>
      {state.message ? (
        <div
          role="status"
          className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-success"
              : "border-red-200 bg-red-50 text-danger"
          }`}
        >
          {state.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <div>
            <p className="font-semibold">{state.message}</p>
            {fieldMessages.length ? (
              <ul className="mt-1 list-inside list-disc text-xs">
                {fieldMessages.slice(0, 6).map((item) => (
                  <li key={`${item.field}-${item.message}`}>{item.message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
      {notice}
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex flex-wrap gap-2">
        <SubmitButton className={submitClassName} pendingLabel={pendingLabel}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
