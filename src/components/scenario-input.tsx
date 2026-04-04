import type { ScenarioPreset } from "@/lib/types";

type ScenarioInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectPreset: (value: string) => void;
  presets: ScenarioPreset[];
  disabled: boolean;
};

export function ScenarioInput({
  value,
  onChange,
  onSelectPreset,
  presets,
  disabled,
}: ScenarioInputProps) {
  return (
    <section className="panel-surface rounded-[2rem] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
            Situation Input
          </p>
          <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
            Describe the problem like you would tell a COO
          </h2>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] uppercase tracking-[0.28em] text-white/45 sm:block">
          Trade-ready
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: Our dispatcher is overwhelmed, late jobs are stacking up, and customers are starting to complain."
        disabled={disabled}
        className="min-h-44 w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-base leading-7 text-white outline-none transition focus:border-[#cf6b2d]/60 focus:bg-black/30 disabled:cursor-not-allowed disabled:opacity-70"
      />

      <div className="mt-5 flex flex-wrap gap-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onSelectPreset(preset.value)}
            disabled={disabled}
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition hover:border-[#cf6b2d]/40 hover:bg-[#cf6b2d]/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}

