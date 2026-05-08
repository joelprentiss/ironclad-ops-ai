import type { ProblemDefinition, ProblemId } from "@/lib/types";

type ProblemActionsProps = {
  problems: ProblemDefinition[];
  activeProblem: ProblemId | null;
  disabled: boolean;
  onSelect: (problemId: ProblemId) => void;
};

export function ProblemActions({
  problems,
  activeProblem,
  disabled,
  onSelect,
}: ProblemActionsProps) {
  return (
    <section className="panel-surface rounded-[1.6rem] p-4 sm:p-5">
      <div className="mb-5">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Pick the problem
        </p>
        <h2 className="font-display mt-2 text-xl uppercase tracking-[0.08em] text-white sm:text-2xl">
          Where are jobs slipping away?
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/62">
          Start with missed calls and slow follow-up. That is often the fastest leak to fix.
        </p>
      </div>

      <div className="grid gap-4">
        {problems.map((problem) => {
          const isActive = activeProblem === problem.id;

          return (
            <button
              key={problem.id}
              type="button"
              onClick={() => onSelect(problem.id)}
              disabled={disabled}
              className={`rounded-[1.3rem] border p-4 text-left transition-all duration-200 sm:p-5 ${
                isActive
                  ? "border-[#cf6b2d]/60 bg-[#cf6b2d]/10 shadow-[0_0_0_1px_rgba(207,107,45,0.18)]"
                  : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    {problem.label}
                  </span>
                  <p className="mt-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/42">
                    {problem.tag}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="rounded-full border border-[#cf6b2d]/40 bg-[#cf6b2d]/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#f1b585]">
                      Selected
                    </span>
                  ) : null}
                  <span
                    className={`status-dot h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-[#e28849]" : "bg-white/20"
                    }`}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm leading-6 text-white/70">{problem.summary}</p>
                  <p className="mt-3 text-sm leading-6 text-white/56">{problem.focus}</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/8 bg-black/[0.14] p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">
                    What you get
                  </p>
                  <div className="mt-3 grid gap-2 text-sm leading-6 text-white/72">
                    <p>Fix-this-first scorecard</p>
                    <p>Text-back script</p>
                    <p>Follow-up templates</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#cf6b2d]/35 bg-black/[0.18] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f1b585]">
                {isActive ? "Problem selected" : "Select this problem"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
