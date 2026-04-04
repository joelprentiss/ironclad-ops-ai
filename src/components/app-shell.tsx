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
  EMPTY_AGENT_SCENARIOS,
  STARTER_SCENARIOS,
} from "@/lib/constants";
import { AUTOPILOT_STEPS } from "@/lib/demo-script";
import type { AgentDefinition, AgentId, AgentResponse } from "@/lib/types";
import { wait } from "@/lib/utils";

type DemoStatus = "idle" | "running" | "complete";

const HERO_PILLS = ["Practical", "High-trust", "Trade-ready", "Demo-quality"];
const PLATFORM_PROMISES = [
  {
    label: "What the owner sees",
    value: "One problem in, one clear response out.",
  },
  {
    label: "What the demo proves",
    value: "Four specialized agents with different outputs.",
  },
  {
    label: "What stays lean",
    value: "No auth, no CRM, no backend complexity yet.",
  },
];

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

function getAgentDefinition(agent: AgentId): AgentDefinition {
  return AGENT_DEFINITIONS.find((item) => item.id === agent) ?? AGENT_DEFINITIONS[0];
}

export function AppShell() {
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentId | null>("ops");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null);
  const [helperText, setHelperText] = useState<string | null>(
    "Start with a real issue or use one of the demo prompts below.",
  );
  const [demoStatus, setDemoStatus] = useState<DemoStatus>("idle");
  const [demoIndex, setDemoIndex] = useState(-1);
  const runTokenRef = useRef(0);
  const [, startTransition] = useTransition();

  const isLoading = loadingLabel !== null;
  const currentStep = demoIndex >= 0 ? AUTOPILOT_STEPS[demoIndex] : null;
  const activeAgentDefinition = activeAgent ? getAgentDefinition(activeAgent) : null;
  const isAutopilotRunning = demoStatus === "running";

  const cancelActiveRun = () => {
    runTokenRef.current += 1;
    setLoadingLabel(null);
    setDemoStatus("idle");
    setDemoIndex(-1);
    setHelperText("Autopilot stopped. You can now run any agent manually.");
  };

  const handleScenarioChange = (value: string) => {
    if (demoStatus === "running") {
      cancelActiveRun();
    }

    setScenario(value);
    setErrorMessage(null);
    setHelperText("Manual mode. Pick the agent that matches the problem you want to solve.");
  };

  const handlePresetSelect = (value: string) => {
    if (demoStatus === "running") {
      cancelActiveRun();
    }

    setScenario(value);
    setErrorMessage(null);
    setHelperText("Starter scenario loaded. Choose an agent to generate a focused response.");
  };

  const handleAgentRun = async (agent: AgentId, nextScenario = scenario) => {
    const fallbackScenario = EMPTY_AGENT_SCENARIOS[agent];
    const trimmedScenario = nextScenario.trim();
    const resolvedScenario = trimmedScenario || fallbackScenario;
    const agentDefinition = getAgentDefinition(agent);
    const token = ++runTokenRef.current;

    if (!trimmedScenario) {
      setScenario(fallbackScenario);
      setHelperText(
        `No input was entered, so ${agentDefinition.panelLabel} loaded a demo-ready example automatically.`,
      );
    } else {
      setHelperText(`${agentDefinition.panelLabel} is building an operator-ready response.`);
    }

    setErrorMessage(null);
    setDemoStatus("idle");
    setDemoIndex(-1);
    setLoadingLabel(agentDefinition.buttonLabel);

    try {
      const nextResponse = await fetchAgentResponse(agent, resolvedScenario);

      if (token !== runTokenRef.current) {
        return;
      }

      setHelperText(
        nextResponse.mode === "live"
          ? `${agentDefinition.panelLabel} used Live AI for this response.`
          : `${agentDefinition.panelLabel} is running in Demo Mode using the local fallback.`,
      );

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
      setHelperText("The response failed. Adjust the prompt or rerun the agent.");
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
    setHelperText("Autopilot is stepping through the full four-agent demo sequence.");

    for (const [index, step] of AUTOPILOT_STEPS.entries()) {
      if (token !== runTokenRef.current) {
        return;
      }

      const nextAgentDefinition = getAgentDefinition(step.agent);

      setDemoIndex(index);
      setLoadingLabel(step.title);
      setHelperText(`${step.title} is routing through ${nextAgentDefinition.panelLabel}.`);

      startTransition(() => {
        setScenario(step.scenario);
        setActiveAgent(step.agent);
      });

      try {
        const nextResponse = await fetchAgentResponse(step.agent, step.scenario);

        if (token !== runTokenRef.current) {
          return;
        }

        setHelperText(
          nextResponse.mode === "live"
            ? `${step.title} completed with Live AI.`
            : `${step.title} completed in Demo Mode using the local fallback.`,
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
            : "The Autopilot Demo could not finish.";

        setErrorMessage(message);
        setResponse(null);
        setLoadingLabel(null);
        setDemoStatus("idle");
        setHelperText("Autopilot hit an error. Rerun the sequence or use manual mode.");
        return;
      }

      await wait(850);
    }

    if (token === runTokenRef.current) {
      setLoadingLabel(null);
      setDemoStatus("complete");
      setHelperText("Autopilot complete. The final Growth brief is ready to present.");
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto min-h-screen max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="panel-surface relative isolate overflow-hidden rounded-[2.4rem] p-5 sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(circle_at_top,_rgba(226,136,73,0.24),_transparent_60%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />

          <header className="grid gap-10 border-b border-white/8 pb-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-7">
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
                  AI operating system for the trades
                </p>
                <h2 className="font-display mt-4 text-5xl uppercase leading-[0.92] tracking-[0.05em] text-white sm:text-6xl xl:text-7xl">
                  Turn messy field problems into clear next moves.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
                  Built for plumbers, electricians, HVAC teams, and owner-operators
                  who need practical answers fast. Ironclad routes the problem to the
                  right agent and returns an output you can actually use.
                </p>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <div className="rounded-[1.8rem] border border-white/8 bg-black/[0.18] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.7rem] uppercase tracking-[0.28em] text-white/42">
                    Demo Build
                  </span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-emerald-200/75">
                    MVP Stage Two
                  </span>
                </div>
                <div className="mt-4 grid gap-4">
                  {PLATFORM_PROMISES.map((item) => (
                    <div key={item.label} className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                      <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                        {item.label}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/74">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    4 Agents
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/66">Ops, sales, marketing, growth.</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    1 Screen
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/66">Built for a fast, founder-led live demo.</p>
                </div>
                <div className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] p-4">
                  <p className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    Local Mock
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/66">Looks functional now, stays easy to extend later.</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/8 bg-black/[0.18] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                    Current lane
                  </p>
                  <p className="font-display mt-3 text-xl uppercase tracking-[0.08em] text-white">
                    {activeAgentDefinition?.panelLabel ?? "Select agent"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-black/[0.18] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                    Mode
                  </p>
                  <p className="font-display mt-3 text-xl uppercase tracking-[0.08em] text-white">
                    {isAutopilotRunning ? "Autopilot" : "Manual"}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-white/8 bg-black/[0.18] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                    Output
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/74">
                    {activeAgentDefinition?.outcome ?? "Structured operating response"}
                  </p>
                </div>
              </div>

              <ScenarioInput
                value={scenario}
                onChange={handleScenarioChange}
                onSelectPreset={handlePresetSelect}
                presets={STARTER_SCENARIOS}
                disabled={isLoading}
                helperText={helperText}
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
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-white/8 bg-black/[0.18] px-4 py-4">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
                    Workspace status
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/74">
                    {helperText ?? "Ready for the next scenario."}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em] ${
                    isAutopilotRunning
                      ? "border-[#cf6b2d]/40 bg-[#cf6b2d]/12 text-[#f1b585]"
                      : "border-white/10 bg-white/[0.04] text-white/52"
                  }`}
                >
                  {isAutopilotRunning ? "Sequence live" : "Ready"}
                </span>
              </div>

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
        </section>
      </div>
    </main>
  );
}
