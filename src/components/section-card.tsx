import type { OutputSection } from "@/lib/types";

type SectionCardProps = {
  section: OutputSection;
  index: number;
};

export function SectionCard({ section, index }: SectionCardProps) {
  return (
    <section className="animate-fade-up rounded-[1.5rem] border border-white/8 bg-white/[0.035] p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cf6b2d]/40 bg-[#cf6b2d]/12 text-xs font-semibold uppercase tracking-[0.18em] text-[#f1b585]">
          {index + 1}
        </span>
        <div>
          <h3 className="font-display text-lg uppercase tracking-[0.08em] text-white">
            {section.title}
          </h3>
          {section.description ? (
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">
              {section.description}
            </p>
          ) : null}
        </div>
      </div>

      {section.format === "text" ? (
        <div className="rounded-[1.2rem] border border-white/8 bg-black/[0.2] p-4">
          <p className="whitespace-pre-line text-sm leading-7 text-white/76">
            {section.body}
          </p>
        </div>
      ) : (
        <ul className="space-y-3 text-sm leading-6 text-white/72">
          {section.bullets?.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#cf6b2d]" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
