import { TradeSelector } from "@/components/trade-selector";
import type { FormEvent } from "react";
import type {
  BusinessSize,
  BusinessSizeDefinition,
  TradeDefinition,
  TradeId,
} from "@/lib/types";

type ScenarioInputProps = {
  value: string;
  goal: string;
  businessSize: BusinessSize;
  selectedTrade: TradeId;
  trades: TradeDefinition[];
  businessSizes: BusinessSizeDefinition[];
  onChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onSelectBusinessSize: (businessSize: BusinessSize) => void;
  onSelectTrade: (tradeId: TradeId) => void;
  onSubmit: () => void;
  disabled: boolean;
  isSubmitting: boolean;
  helperText: string | null;
};

export function ScenarioInput({
  value,
  goal,
  businessSize,
  selectedTrade,
  trades,
  businessSizes,
  onChange,
  onGoalChange,
  onSelectBusinessSize,
  onSelectTrade,
  onSubmit,
  disabled,
  isSubmitting,
  helperText,
}: ScenarioInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="panel-surface rounded-[1.6rem] p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.32em] text-white/40">
            Tell us what happens now
          </p>
          <h2 className="font-display mt-2 text-xl uppercase tracking-[0.08em] text-white sm:text-2xl">
            Keep it quick
          </h2>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.7rem] uppercase tracking-[0.28em] text-white/45 sm:block">
          No signup
        </div>
      </div>

      <p className="mb-5 text-sm leading-6 text-white/62">
        Choose your trade and describe what happens when a customer calls, leaves a
        voicemail, fills out a form, or asks for a quote.
      </p>

      <TradeSelector
        trades={trades}
        selectedTrade={selectedTrade}
        disabled={disabled}
        onSelect={onSelectTrade}
      />

      <div className="mt-5 rounded-[1.2rem] border border-white/8 bg-black/[0.16] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">
              Business size
            </p>
            <p className="mt-1 text-sm leading-6 text-white/62">
              This helps the plan set realistic ownership and follow-up rules.
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {businessSizes.map((size) => {
            const isSelected = businessSize === size.id;

            return (
              <button
                key={size.id}
                type="button"
                onClick={() => onSelectBusinessSize(size.id)}
                disabled={disabled}
                className={`min-h-24 rounded-[1rem] border p-3 text-left transition ${
                  isSelected
                    ? "border-[#cf6b2d]/55 bg-[#cf6b2d]/12"
                    : "border-white/8 bg-white/[0.025] hover:border-white/18 hover:bg-white/[0.045]"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="font-display text-sm uppercase tracking-[0.08em] text-white">
                  {size.label}
                </span>
                <span className="mt-2 block text-xs leading-5 text-white/56">
                  {size.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Example: We run a plumbing company. If we miss a call, nobody texts back right away. Website leads sometimes sit until the next morning, and we do not have a clear follow-up process."
        disabled={disabled}
        className="mt-5 min-h-44 w-full rounded-[1.2rem] border border-white/10 bg-black/[0.24] px-4 py-4 text-base leading-7 text-white outline-none transition focus:border-[#cf6b2d]/60 focus:bg-black/[0.32] disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-48 sm:px-5"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-white/42">
          {helperText ?? "Paste the real callback and follow-up process from your shop."}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-white/32">
          {value.trim().length} chars
        </p>
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-[0.68rem] uppercase tracking-[0.22em] text-white/38">
          Goal
        </span>
        <input
          value={goal}
          onChange={(event) => onGoalChange(event.target.value)}
          disabled={disabled}
          className="min-h-12 w-full rounded-[1.05rem] border border-white/10 bg-black/[0.24] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#cf6b2d]/60 focus:bg-black/[0.32] disabled:cursor-not-allowed disabled:opacity-70"
          placeholder="Example: Book more jobs from the calls and leads we already get."
        />
      </label>

      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="mt-5 min-h-12 w-full rounded-full border border-[#cf6b2d]/45 bg-[#cf6b2d]/18 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1b585] transition hover:bg-[#cf6b2d]/24 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting ? "Building your plan" : "Get my plan + templates"}
      </button>
    </form>
  );
}
