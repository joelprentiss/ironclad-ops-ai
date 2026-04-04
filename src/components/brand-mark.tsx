export function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-11 w-11 grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-white/5 p-2">
        <span className="rounded-sm bg-white" />
        <span className="rounded-sm bg-[#cf6b2d]" />
        <span className="rounded-sm bg-white" />
        <span className="rounded-sm bg-white" />
        <span className="rounded-sm bg-white/20" />
        <span className="rounded-sm bg-[#cf6b2d]" />
        <span className="rounded-sm bg-white" />
        <span className="rounded-sm bg-white" />
        <span className="rounded-sm bg-white/20" />
      </div>
      <div>
        <p className="text-[0.7rem] uppercase tracking-[0.32em] text-white/45">
          Ironclad Systems
        </p>
        <h1 className="font-display text-2xl uppercase tracking-[0.1em] text-white">
          Ironclad Ops AI
        </h1>
      </div>
    </div>
  );
}

