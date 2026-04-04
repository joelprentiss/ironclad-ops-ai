import type { ScenarioPreset } from "@/lib/types";

type ScenarioInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelectPreset: (value: string) => void;
  presets: ScenarioPreset[];
  disabled: boolean;
  helperText: string | null;
};

export function ScenarioInput({
  value,
  onChange,
  onSelectPreset,
  presets,
  disabled,
  helperText,
}: ScenarioInputProps) {
  return (
    <section className="panel-surface rounded-[2rem] p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
            Operator Briefing
          </p>
          <h2 className="font-display mt-2 text-2xl uppercase tracking-[0.08em] text-white">
            Describe the situation like you would text your operations lead
          </h2>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] uppercase tracking-[0.28em] text-white/45 sm:block">
          Live workspace
        </div>
      </div>

      <p className="mb-4 max-w-2xl text-sm leading-7 text-white/62">
        Paste the business issue, customer request, or growth question. Ironclad
        will route it into a practical operating response instead of generic chat.
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: I run a plumbing business. Jobs are always late and customers are complaining."
        disabled={disabled}
        className="min-h-48 w-full rounded-[1.5rem] border border-white/10 bg-black/[0.24] px-5 py-4 text-base leading-7 text-white outline-none transition focus:border-[#cf6b2d]/60 focus:bg-black/[0.32] disabled:cursor-not-allowed disabled:opacity-70"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/42">
          {helperText ?? "Use a starter prompt or enter a real trade-business scenario."}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/32">
          {value.trim().length} chars
        </p>
      </div>

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
