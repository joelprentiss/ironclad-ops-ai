import type { TradeDefinition, TradeId } from "@/lib/types";

type TradeSelectorProps = {
  trades: TradeDefinition[];
  selectedTrade: TradeId;
  disabled: boolean;
  onSelect: (tradeId: TradeId) => void;
};

export function TradeSelector({
  trades,
  selectedTrade,
  disabled,
  onSelect,
}: TradeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] uppercase tracking-[0.24em] text-white/40">
          Your trade
        </p>
        <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/32">
          Makes the plan fit your calls
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {trades.map((trade) => {
          const isActive = selectedTrade === trade.id;

          return (
            <button
              key={trade.id}
              type="button"
              onClick={() => onSelect(trade.id)}
              disabled={disabled}
              className={`rounded-[1.3rem] border p-4 text-left transition-all duration-200 ${
                isActive
                  ? "border-[#cf6b2d]/60 bg-[#cf6b2d]/10 shadow-[0_0_0_1px_rgba(207,107,45,0.16)]"
                  : "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base uppercase tracking-[0.08em] text-white">
                    {trade.label}
                  </p>
                  <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-white/42">
                    {trade.tag}
                  </p>
                </div>
                <span
                  className={`status-dot h-2.5 w-2.5 rounded-full ${
                    isActive ? "bg-[#e28849]" : "bg-white/20"
                  }`}
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-white/68">{trade.focus}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
