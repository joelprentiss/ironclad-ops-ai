"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  LEAD_CAPTURE_ACTIONS,
  getLeadCaptureAction,
} from "@/lib/lead-capture";
import type {
  DiagnosticResponse,
  LeadCaptureAction,
  LeadCapturePayload,
  LeadCaptureResult,
} from "@/lib/types";

type PostAuditConversionProps = {
  response: DiagnosticResponse;
  scenario: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  businessName: string;
};

const INITIAL_FORM_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
};

async function submitLeadCapture(payload: LeadCapturePayload) {
  const response = await fetch("/api/lead-capture", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "The request could not be received.");
  }

  return (await response.json()) as LeadCaptureResult;
}

export function PostAuditConversion({
  response,
  scenario,
}: PostAuditConversionProps) {
  const [selectedAction, setSelectedAction] =
    useState<LeadCaptureAction>("send_plan");
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<LeadCaptureResult | null>(null);

  const activeAction = getLeadCaptureAction(selectedAction);

  const updateField =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
      setErrorMessage(null);
      setResult(null);
    };

  const handleSelectAction = (action: LeadCaptureAction) => {
    setSelectedAction(action);
    setErrorMessage(null);
    setResult(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const nextResult = await submitLeadCapture({
        action: selectedAction,
        name: form.name,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName,
        tradeId: response.tradeId,
        tradeLabel: response.tradeLabel,
        problemId: response.problemId,
        auditTitle: response.title,
        scenario,
        source: "post_audit_cta",
      });

      setResult(nextResult);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The request could not be received.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-[1.6rem] border border-[#cf6b2d]/18 bg-[#cf6b2d]/8 p-4 sm:p-5">
      <div className="grid gap-5">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#f1b585]/78">
            Want this installed?
          </p>
          <h3 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
            Have Ironclad Ops build it for you
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/72">
            {response.implementationOffer.body}
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/42">
            Keep the plan, grab the templates, or ask for help installing the workflow.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {LEAD_CAPTURE_ACTIONS.map((action) => {
              const isActive = selectedAction === action.id;
              const isStrong = action.priority === "strong";

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleSelectAction(action.id)}
                  className={`min-h-32 rounded-[1.25rem] border p-4 text-left transition ${
                    isActive
                      ? "border-[#cf6b2d]/55 bg-[#cf6b2d]/14"
                      : isStrong
                        ? "border-[#cf6b2d]/28 bg-[#cf6b2d]/8 hover:border-[#cf6b2d]/42 hover:bg-[#cf6b2d]/12"
                        : "border-white/10 bg-black/[0.16] hover:border-white/18 hover:bg-white/[0.04]"
                  }`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`text-[0.66rem] uppercase tracking-[0.22em] ${
                      isStrong ? "text-[#f1b585]/82" : "text-white/42"
                    }`}
                  >
                    {action.eyebrow}
                  </span>
                  <span className="font-display mt-3 block text-base uppercase leading-5 tracking-[0.06em] text-white">
                    {action.label}
                  </span>
                  <span className="mt-3 block text-xs leading-5 text-white/60">
                    {action.description}
                  </span>
                </button>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[1.3rem] border border-white/10 bg-black/[0.18] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                  {activeAction.eyebrow}
                </p>
                <h4 className="font-display mt-2 text-lg uppercase tracking-[0.07em] text-white">
                  Where should we send it?
                </h4>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.66rem] uppercase tracking-[0.18em] text-white/50">
                No signup
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                  Name
                </span>
                <input
                  value={form.name}
                  onChange={updateField("name")}
                  className="w-full rounded-[0.9rem] border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#cf6b2d]/50"
                  placeholder="Owner or operator"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                  Email
                </span>
                <input
                  value={form.email}
                  onChange={updateField("email")}
                  className="w-full rounded-[0.9rem] border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#cf6b2d]/50"
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="space-y-2">
                <span className="text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                  Phone
                </span>
                <input
                  value={form.phone}
                  onChange={updateField("phone")}
                  className="w-full rounded-[0.9rem] border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#cf6b2d]/50"
                  placeholder="Best callback number"
                  type="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[0.66rem] uppercase tracking-[0.2em] text-white/40">
                  Business
                </span>
                <input
                  value={form.businessName}
                  onChange={updateField("businessName")}
                  className="w-full rounded-[0.9rem] border border-white/10 bg-black/30 px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#cf6b2d]/50"
                  placeholder={`${response.tradeLabel} company`}
                  autoComplete="organization"
                />
              </label>
            </div>

            {errorMessage ? (
              <p className="mt-3 rounded-[0.9rem] border border-rose-400/20 bg-rose-400/8 px-3 py-2 text-sm text-rose-100/82">
                {errorMessage}
              </p>
            ) : null}

            {result ? (
              <p className="mt-3 rounded-[0.9rem] border border-emerald-400/20 bg-emerald-400/8 px-3 py-2 text-sm text-emerald-100/82">
                Request received. Your plan details are attached.
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-full border border-[#cf6b2d]/45 bg-[#cf6b2d]/18 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1b585] transition hover:bg-[#cf6b2d]/24 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Sending request" : activeAction.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
