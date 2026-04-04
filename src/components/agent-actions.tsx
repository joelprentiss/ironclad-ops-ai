import type { AgentDefinition, AgentId } from "@/lib/types";

type AgentActionsProps = {
  agents: AgentDefinition[];
  activeAgent: AgentId | null;
  disabled: boolean;
  onRun: (agent: AgentId) => void;
};

export function AgentActions({
  agents,
  activeAgent,
  disabled,
  onRun,
}: AgentActionsProps) {
  return (
    <section className="panel-surface rounded-[2rem] p-6">
      <div className="mb-5">
        <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
          Agent Console
        </p>
        <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
          Pick the operator lens that should take the lead
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
          Each action generates a different working output so the demo feels like
          a real operating system, not a one-size-fits-all chatbot.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {agents.map((agent) => {
          const isActive = activeAgent === agent.id;

          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => onRun(agent.id)}
              disabled={disabled}
              className={`rounded-[1.6rem] border p-5 text-left transition-all duration-200 ${
                isActive
                  ? "border-[#cf6b2d]/60 bg-[#cf6b2d]/10 shadow-[0_0_0_1px_rgba(207,107,45,0.18)]"
                  : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <span className="font-display text-lg uppercase tracking-[0.08em] text-white">
                    {agent.buttonLabel}
                  </span>
                  <p className="mt-2 text-[0.72rem] uppercase tracking-[0.22em] text-white/42">
                    {agent.focus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="rounded-full border border-[#cf6b2d]/40 bg-[#cf6b2d]/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#f1b585]">
                      Active
                    </span>
                  ) : null}
                  <span
                    className={`status-dot h-2.5 w-2.5 rounded-full ${
                      isActive ? "bg-[#e28849]" : "bg-white/20"
                    }`}
                  />
                </div>
              </div>
              <p className="text-sm leading-6 text-white/70">{agent.summary}</p>
              <p className="mt-4 text-sm leading-6 text-[#f1b585]/80">
                {agent.outcome}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
