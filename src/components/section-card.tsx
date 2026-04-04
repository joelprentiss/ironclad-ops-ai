import type { OutputSection } from "@/lib/types";

type SectionCardProps = {
  section: OutputSection;
  index: number;
};

export function SectionCard({ section, index }: SectionCardProps) {
  return (
    <section className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cf6b2d]/40 bg-[#cf6b2d]/12 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1b585]">
          {index + 1}
        </span>
        <h3 className="font-display text-lg uppercase tracking-[0.08em] text-white">
          {section.title}
        </h3>
      </div>
      <ul className="space-y-3 text-sm leading-6 text-white/72">
        {section.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cf6b2d]" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

