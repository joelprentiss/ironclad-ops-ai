"use client";

import { useRef, useState, useTransition } from "react";
import { AgentActions } from "@/components/agent-actions";
import { AutopilotDemo } from "@/components/autopilot-demo";
import { BrandMark } from "@/components/brand-mark";
import { OutputPanel } from "@/components/output-panel";
import { ScenarioInput } from "@/components/scenario-input";
import {
  AGENT_DEFINITIONS,
  DEFAULT_SCENARIO,
  STARTER_SCENARIOS,
} from "@/lib/constants";
import { AUTOPILOT_STEPS } from "@/lib/demo-script";
import type { AgentId, AgentResponse } from "@/lib/types";
import { wait } from "@/lib/utils";

type DemoStatus = "idle" | "running" | "complete";

async function fetchAgentResponse(agent: AgentId, scenario: string) {
  const response = await fetch("/api/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agent, scenario }),
  });

  if (!response.ok) {
    const error = (await response.json()) as { error?: string };
    throw new Error(error.error ?? "Something went wrong while generating the response.");
  }

  return (await response.json()) as AgentResponse;
}

export function AppShell() {
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>("ops");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [demoIndex, setDemoIndex] = useState(-1);
  const runTokenRef = useRef(0);
  const [, startTransition] = useTransition();

  const isLoading = loadingLabel !== null;
  const currentStep = demoIndex >= 0 ? AUTOPILOT_STEPS[demoIndex] : null;

  const cancelActiveRun = () => {
    runTokenRef.current += 1;
    setLoadingLabel(null);
    setDemoStatus("idle");
    setDemoIndex(-1);
  };

  const handleScenarioChange = (value: string) => {
    if (demoStatus === "running") {
      cancelActiveRun();
    }

    setScenario(value);
  };

  const handlePresetSelect = (value: string) => {
    if (demoStatus === "running") {
      cancelActiveRun();
    }

    setScenario(value);
  };

  const handleAgentRun = async (agent: AgentId, nextScenario = scenario) => {
    const trimmedScenario = nextScenario.trim();

    if (!trimmedScenario) {
      return;
    }

    const token = ++runTokenRef.current;
    setErrorMessage(null);
    setDemoStatus("idle");
    setDemoIndex(-1);
    setLoadingLabel(
      AGENT_DEFINITIONS.find((item) => item.id === agent)?.buttonLabel ?? "Analyzing",
    );

    try {
      const nextResponse = await fetchAgentResponse(agent, trimmedScenario);

      if (token !== runTokenRef.current) {
        return;
      }

      startTransition(() => {
        setActiveAgent(agent);
        setResponse(nextResponse);
      });
    } catch (error) {
      if (token !== runTokenRef.current) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "The request failed before the demo output was generated.";

      setErrorMessage(message);
      setResponse(null);
    } finally {
      if (token === runTokenRef.current) {
        setLoadingLabel(null);
      }
    }
  };

  const handleAutopilot = async () => {
    const token = ++runTokenRef.current;
    setErrorMessage(null);
    setResponse(null);
    setDemoStatus("running");

    for (const [index, step] of AUTOPILOT_STEPS.entries()) {
      if (token !== runTokenRef.current) {
        return;
      }

      setDemoIndex(index);
      setLoadingLabel(step.title);
      startTransition(() => {
        setScenario(step.scenario);
        setActiveAgent(step.agent);
      });

      try {
        const nextResponse = await fetchAgentResponse(step.agent, step.scenario);

        if (token !== runTokenRef.current) {
          return;
        }

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
            : "The Autopilot Demo could not finish.";

        setErrorMessage(message);
        setResponse(null);
        setLoadingLabel(null);
        setDemoStatus("idle");
        return;
      }

      await wait(700);
    }

    if (token === runTokenRef.current) {
      setLoadingLabel(null);
      setDemoStatus("complete");
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto min-h-screen max-w-[1440px] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <div className="panel-surface rounded-[2.2rem] p-5 sm:p-7 lg:p-8">
          <header className="grid gap-10 border-b border-white/8 pb-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <BrandMark />
              <div className="max-w-3xl">
                <p className="text-[0.72rem] uppercase tracking-[0.32em] text-[#f1b585]/74">
                  Virtual COO for Trade Businesses
                </p>
                <h2 className="font-display mt-4 text-5xl uppercase leading-none tracking-[0.06em] text-white sm:text-6xl">
                  The operating system for shops that need decisions fast.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
                  Demo the exact moment a plumbing, HVAC, or electrical owner
                  drops in a problem and Ironclad routes it to the right agent
                  with a usable answer.
                </p>
              </div>
            </div>

            <div className="grid gap-4 self-end rounded-[1.8rem] border border-white/8 bg-black/[0.18] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.7rem] uppercase tracking-[0.28em] text-white/42">
                  Demo Build
                </span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-emerald-200/75">
                  MVP v1
                </span>
              </div>
              <div className="grid gap-3 text-sm text-white/70 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    4 Agents
                  </p>
                  <p className="mt-1 leading-6">Ops, sales, marketing, and growth.</p>
                </div>
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    1 Screen
                  </p>
                  <p className="mt-1 leading-6">No clutter, no auth, no setup friction.</p>
                </div>
                <div>
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    Demo Ready
                  </p>
                  <p className="mt-1 leading-6">Autopilot script for a clean three-minute story.</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <ScenarioInput
                value={scenario}
                onChange={handleScenarioChange}
                onSelectPreset={handlePresetSelect}
                presets={STARTER_SCENARIOS}
                disabled={isLoading}
              />

              <AgentActions
                agents={AGENT_DEFINITIONS}
                activeAgent={activeAgent}
                disabled={isLoading}
                onRun={handleAgentRun}
              />

              <AutopilotDemo
                steps={AUTOPILOT_STEPS}
                activeIndex={demoIndex}
                status={demoStatus}
                disabled={isLoading}
                onRun={handleAutopilot}
                onStop={cancelActiveRun}
              />
            </div>

            <aside className="panel-surface rounded-[2rem] p-6 lg:p-7">
              <OutputPanel
                response={response}
                isLoading={isLoading}
                loadingLabel={loadingLabel}
                errorMessage={errorMessage}
                currentStepTitle={
                  demoStatus === "running" || demoStatus === "complete"
                    ? currentStep?.title ?? null
                    : null
                }
              />
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
