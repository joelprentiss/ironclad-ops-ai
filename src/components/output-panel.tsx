import { SectionCard } from "@/components/section-card";
import type { AgentResponse } from "@/lib/types";

type OutputPanelProps = {
  response: AgentResponse | null;
  isLoading: boolean;
  loadingLabel: string | null;
  errorMessage: string | null;
  currentStepTitle: string | null;
};

function LoadingState({ loadingLabel }: { loadingLabel: string | null }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Processing
        </p>
        <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
          {loadingLabel ?? "Building response"}
        </h2>
      </div>
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5"
          >
            <div className="h-4 w-40 rounded-full bg-white/10" />
            <div className="mt-4 h-3 w-full rounded-full bg-white/7" />
            <div className="mt-3 h-3 w-5/6 rounded-full bg-white/7" />
            <div className="mt-3 h-3 w-2/3 rounded-full bg-white/7" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Decision Workspace
        </p>
        <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
          Structured operating output will land here
        </h2>
      </div>

      <div className="rounded-[1.6rem] border border-dashed border-white/12 bg-black/10 p-6">
        <p className="text-sm leading-7 text-white/70">
          Choose an agent or run Autopilot Demo to generate a serious operator-ready
          response with a working draft, clear sections, and next actions.
        </p>
      </div>

      <div className="grid gap-3">
        {[
          "Ops playbook and SOP",
          "Sales quote and SMS draft",
          "Marketing content assets",
          "Growth scaling brief",
        ].map((label) => (
          <div
            key={label}
            className="rounded-[1.3rem] border border-white/8 bg-white/[0.03] px-4 py-4"
          >
            <p className="font-display text-lg uppercase tracking-[0.08em] text-white/84">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutputPanel({
  response,
  isLoading,
  loadingLabel,
  errorMessage,
  currentStepTitle,
}: OutputPanelProps) {
  if (isLoading) {
    return <LoadingState loadingLabel={loadingLabel} />;
  }

  if (errorMessage) {
    return (
      <div className="space-y-4 rounded-[1.6rem] border border-rose-400/20 bg-rose-400/8 p-6">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-rose-200/70">
          Request Error
        </p>
        <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-white">
          The response could not be generated
        </h2>
        <p className="text-sm leading-7 text-white/75">{errorMessage}</p>
      </div>
    );
  }

  if (!response) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[#cf6b2d]/35 bg-[#cf6b2d]/12 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-[#f1b585]">
            {response.agentLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-white/50">
            {response.tradeContext}
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-white/50">
            {response.urgency} urgency
          </span>
          {currentStepTitle ? (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/8 px-3 py-1 text-[0.7rem] uppercase tracking-[0.24em] text-emerald-200/75">
              {currentStepTitle}
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
            Agent Output
          </p>
          <h2 className="font-display mt-2 text-3xl uppercase tracking-[0.08em] text-white">
            {response.title}
          </h2>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/42">
            {response.subtitle}
          </p>
        </div>
        <p className="max-w-3xl text-sm leading-7 text-white/72">
          {response.summary}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {response.highlights.map((highlight) => (
          <div
            key={highlight.label}
            className="rounded-[1.3rem] border border-white/8 bg-black/[0.2] px-4 py-4"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/38">
              {highlight.label}
            </p>
            <p className="font-display mt-3 text-lg uppercase tracking-[0.06em] text-white">
              {highlight.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {response.sections.map((section, index) => (
          <SectionCard key={section.title} section={section} index={index} />
        ))}
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Suggested Next Actions
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {response.quickActions.map((action) => (
            <div
              key={action}
              className="rounded-full border border-white/12 bg-black/[0.15] px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/74"
            >
              {action}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/10 bg-black/[0.16] p-5">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Agent Prompt Placeholder
        </p>
        <p className="mt-3 text-sm leading-7 text-white/66">
          {response.promptPlaceholder}
        </p>
      </div>
    </div>
  );
}
