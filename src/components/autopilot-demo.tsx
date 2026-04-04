import type { DemoStep } from "@/lib/types";

type AutopilotDemoProps = {
  steps: DemoStep[];
  activeIndex: number;
  status: "idle" | "running" | "complete";
  disabled: boolean;
  onRun: () => void;
  onStop: () => void;
};

export function AutopilotDemo({
  steps,
  activeIndex,
  status,
  disabled,
  onRun,
  onStop,
}: AutopilotDemoProps) {
  const progress = status === "idle" ? 0 : status === "complete" ? steps.length : activeIndex + 1;

  return (
    <section className="panel-surface rounded-[2rem] p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
            Autopilot Demo
          </p>
          <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
            Run the 4-step live demo sequence
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
            This walks through operations, sales, marketing, and growth in one
            polished flow so the product story lands in minutes.
          </p>
        </div>
        {status === "running" ? (
          <button
            type="button"
            onClick={onStop}
            className="rounded-full border border-white/14 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/70 transition hover:border-white/24 hover:text-white"
          >
            Stop Demo
          </button>
        ) : (
          <button
            type="button"
            onClick={onRun}
            disabled={disabled}
            className="rounded-full border border-[#cf6b2d]/50 bg-[#cf6b2d]/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#f2b78c] transition hover:bg-[#cf6b2d]/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Run Autopilot Demo
          </button>
        )}
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2">
        {steps.map((step, index) => {
          const isFilled = index < progress;

          return (
            <div
              key={`${step.id}-progress`}
              className={`h-2 rounded-full transition ${
                isFilled ? "bg-[#cf6b2d]" : "bg-white/8"
              }`}
            />
          );
        })}
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = activeIndex === index && status === "running";
          const isComplete =
            status === "complete" || (status === "running" && index < activeIndex);

          return (
            <div
              key={step.id}
              className={`rounded-[1.35rem] border px-4 py-4 transition ${
                isActive
                  ? "border-[#cf6b2d]/60 bg-[#cf6b2d]/10"
                  : isComplete
                    ? "border-emerald-400/25 bg-emerald-400/8"
                    : "border-white/8 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{step.note}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/[0.18] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-white/50">
                  {step.agent}
                </span>
              </div>
              <p className="mt-4 rounded-[1rem] border border-white/8 bg-black/[0.18] px-4 py-3 text-sm leading-6 text-white/72">
                {step.scenario}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
