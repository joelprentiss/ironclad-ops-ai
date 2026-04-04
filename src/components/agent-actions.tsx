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
          Agent Actions
        </p>
        <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
          Choose the lens that fits the problem
        </h2>
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
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                isActive
                  ? "border-[#cf6b2d]/60 bg-[#cf6b2d]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className="font-display text-lg uppercase tracking-[0.08em] text-white">
                  {agent.buttonLabel}
                </span>
                <span
                  className={`status-dot h-2.5 w-2.5 rounded-full ${
                    isActive ? "bg-[#e28849]" : "bg-white/20"
                  }`}
                />
              </div>
              <p className="text-sm leading-6 text-white/70">{agent.summary}</p>
              <p className="mt-4 text-[0.72rem] uppercase tracking-[0.22em] text-white/42">
                {agent.focus}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
