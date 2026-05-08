"use client";

import { useRef, useState, useTransition } from "react";
import { BrandMark } from "@/components/brand-mark";
import { OutputPanel } from "@/components/output-panel";
import { ScenarioInput } from "@/components/scenario-input";
import {
  BUSINESS_SIZE_OPTIONS,
  DEFAULT_BUSINESS_SIZE,
  DEFAULT_DIAGNOSTIC_GOAL,
  DEFAULT_PROBLEM_ID,
  DEFAULT_TRADE_ID,
  TRADE_DEFINITIONS,
  getTradeDefinition,
  getTradeFallbackScenario,
} from "@/lib/constants";
import type {
  BusinessDiagnosticPayload,
  BusinessSize,
  DiagnosticResponse,
  TradeId,
} from "@/lib/types";

const HERO_PILLS = ["Missed calls", "Slow follow-up", "Lost jobs"];

async function fetchDiagnosticResponse(
  payload: BusinessDiagnosticPayload,
) {
  const response = await fetch("/api/diagnose", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Something went wrong while generating the plan.");
  }

  return (await response.json()) as DiagnosticResponse;
}

export function AppShell() {
  const [scenario, setScenario] = useState("");
  const [businessSize, setBusinessSize] =
    useState<BusinessSize>(DEFAULT_BUSINESS_SIZE);
  const [goal, setGoal] = useState(DEFAULT_DIAGNOSTIC_GOAL);
  const [selectedTrade, setSelectedTrade] = useState<TradeId>(DEFAULT_TRADE_ID);
  const [response, setResponse] = useState<DiagnosticResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [helperText, setHelperText] = useState<string | null>(
    "A few plain-English sentences is enough.",
  );
  const runTokenRef = useRef(0);
  const inputRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const isLoading = loadingLabel !== null;
  const selectedTradeDefinition = getTradeDefinition(selectedTrade);

  const invalidatePendingResult = () => {
    runTokenRef.current += 1;
    setLoadingLabel(null);
    setResponse(null);
  };

  const handleScenarioChange = (value: string) => {
    invalidatePendingResult();
    setScenario(value);
    setErrorMessage(null);
    setHelperText(
      `Add the real callback and follow-up process your ${selectedTradeDefinition.label.toLowerCase()} shop uses today.`,
    );
  };

  const handleGoalChange = (value: string) => {
    invalidatePendingResult();
    setGoal(value);
    setErrorMessage(null);
    setHelperText("Goal updated. The plan will aim the templates at that outcome.");
  };

  const handleBusinessSizeSelect = (nextBusinessSize: BusinessSize) => {
    invalidatePendingResult();
    setBusinessSize(nextBusinessSize);
    setErrorMessage(null);
    setHelperText(
      "Business size updated. The plan will adjust ownership and handoff rules.",
    );
  };

  const handleTradeSelect = (tradeId: TradeId) => {
    invalidatePendingResult();
    const trade = getTradeDefinition(tradeId);

    setSelectedTrade(tradeId);
    setErrorMessage(null);
    setHelperText(
      `${trade.label} selected. The plan will tailor scripts and follow-up rules to ${trade.focus.toLowerCase()}.`,
    );
  };

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGenerateDiagnostic = async () => {
    const problemId = DEFAULT_PROBLEM_ID;
    const fallbackScenario = getTradeFallbackScenario(selectedTrade);
    const trimmedScenario = scenario.trim();
    const resolvedScenario = trimmedScenario || fallbackScenario;
    const resolvedGoal = goal.trim() || DEFAULT_DIAGNOSTIC_GOAL;
    const tradeDefinition = getTradeDefinition(selectedTrade);
    const token = ++runTokenRef.current;

    setErrorMessage(null);
    setResponse(null);
    setLoadingLabel(`${tradeDefinition.label} plan`);

    if (!trimmedScenario) {
      setScenario(fallbackScenario);
      setHelperText(
        `No context was entered, so a realistic ${tradeDefinition.label.toLowerCase()} scenario was used.`,
      );
    } else {
      setHelperText(
        `Building a ${tradeDefinition.label.toLowerCase()} plan from your notes.`,
      );
    }

    try {
      const nextResponse = await fetchDiagnosticResponse({
        trade: selectedTrade,
        problemType: problemId,
        businessSize,
        currentProcess: resolvedScenario,
        goal: resolvedGoal,
        contactIntent: "undecided",
      });

      if (token !== runTokenRef.current) {
        return;
      }

      setHelperText(
        nextResponse.mode === "live"
          ? "Plan ready. Choose whether to send it, get templates, or have Ironclad Ops build it."
          : "Plan ready using built-in templates. Choose the next step below the output.",
      );

      startTransition(() => {
        setResponse(nextResponse);
      });
    } catch (error) {
      if (token !== runTokenRef.current) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "The request failed before the plan was generated.";

      setErrorMessage(message);
      setResponse(null);
      setHelperText("The plan failed. Adjust the context or run it again.");
    } finally {
      if (token === runTokenRef.current) {
        setLoadingLabel(null);
      }
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto min-h-screen max-w-5xl px-3 py-3 sm:px-6 lg:px-8 lg:py-6">
        <section className="panel-surface relative isolate overflow-hidden rounded-[1.8rem] p-4 sm:rounded-[2.2rem] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,_rgba(226,136,73,0.24),_transparent_60%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

          <header className="relative border-b border-white/8 pb-7 sm:pb-8">
            <div className="max-w-3xl space-y-6">
              <BrandMark />

              <div className="flex flex-wrap gap-2">
                {HERO_PILLS.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-white/50"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="max-w-4xl">
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#f1b585]/74">
                  Free missed-call and follow-up check
                </p>
                <h2 className="font-display mt-4 text-4xl uppercase leading-[0.96] tracking-[0.05em] text-white sm:text-5xl lg:text-6xl">
                  Stop losing jobs after the first missed call.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/68">
                  Tell Ironclad what happens when a customer calls, leaves a voicemail,
                  or asks for a quote. Get a plain-English fix, text-back script, and
                  follow-up templates you can use today.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={scrollToInput}
                    className="min-h-12 rounded-full border border-[#cf6b2d]/45 bg-[#cf6b2d]/18 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1b585] transition hover:bg-[#cf6b2d]/24 hover:text-white"
                  >
                    Find my revenue leaks
                  </button>
                  <p className="text-sm leading-6 text-white/52">
                    Takes about two minutes. No signup to see the result.
                  </p>
                </div>
              </div>
            </div>
          </header>

          <div ref={inputRef} className="mx-auto mt-7 max-w-3xl space-y-5 sm:mt-8 sm:space-y-6">
            <ScenarioInput
              value={scenario}
              goal={goal}
              businessSize={businessSize}
              selectedTrade={selectedTrade}
              trades={TRADE_DEFINITIONS}
              businessSizes={BUSINESS_SIZE_OPTIONS}
              onChange={handleScenarioChange}
              onGoalChange={handleGoalChange}
              onSelectBusinessSize={handleBusinessSizeSelect}
              onSelectTrade={handleTradeSelect}
              onSubmit={handleGenerateDiagnostic}
              disabled={isLoading}
              isSubmitting={isLoading}
              helperText={helperText}
            />

            <section className="panel-surface rounded-[1.6rem] p-4 sm:p-5 lg:p-6">
              <OutputPanel
                response={response}
                scenario={scenario}
                isLoading={isLoading}
                loadingLabel={loadingLabel}
                errorMessage={errorMessage}
              />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
