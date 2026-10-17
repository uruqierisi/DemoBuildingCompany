import { SectionLink } from '@/components/layout/SectionLink';
import { RenderPicture } from '@/components/media/RenderPicture';
import { buttonArrowClasses, buttonClasses } from '@/components/ui/button-styles';
import { Icon } from '@/components/ui/Icon';
import { SITE } from '@/config/site';
import type { Project } from '@/data/types';
import { formatForSaleCount, formatInteger } from '@/lib/format';

interface ProjectHeroProps {
  readonly project: Project;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  const forSale = project.stats.find((stat) => stat.id === 'forSale')?.value ?? 0;
  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[max(calc(100svh-var(--contact-bar-height)),36rem)] flex-col justify-end overflow-hidden bg-ink text-white"
    >
      {project.heroImage ? (
        <>
          <RenderPicture
            image={project.heroImage}
            alt={`Pamje e kompleksit ${project.name}`}
            sizes="100vw"
            priority
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          {/* Ink scrim for legible type over any render. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-ink/90 via-ink/70 via-55% to-ink/45"
          />
        </>
      ) : (
        <ColumnLines />
      )}

      <div className="page-container pt-[calc(var(--header-height)+3rem)] pb-24">
        <div className="page-grid items-end gap-y-10">
          <div className="col-span-full lg:col-span-8">
            <p className="eyebrow text-white">Një projekt i {SITE.company}</p>
            <h1 id="hero-title" translate="no" className="mt-6 text-display">
              {project.name}
            </h1>
          </div>

          <div className="col-span-full md:col-span-6 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[40ch] text-lead text-white">{project.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SectionLink sectionId="objektet" className={buttonClasses('primary', 'fluid')}>
                <span>Zgjidh banesën</span>
                <Icon name="arrow-right" className={buttonArrowClasses} />
              </SectionLink>
              <SectionLink sectionId="kontakti" className={buttonClasses('outline-inverse', 'fluid')}>
                Na kontaktoni
              </SectionLink>
            </div>
          </div>
        </div>

        <div className="mt-14 flex items-baseline justify-end gap-6 border-t border-line-inverse pt-5 text-caption text-white md:justify-between lg:mt-20">
          <p className="hidden md:block">{project.tagline}</p>
          <p className="shrink-0 tabular-nums">
            {project.heroImage
              ? 'Pamje ilustruese'
              : `${formatInteger(project.buildings.length)} objekte · ${formatForSaleCount(forSale)}`}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Without a render: the page grid's column lines, faint, as a drafting-sheet ground for the type. */
function ColumnLines() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="page-container page-grid h-full">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            className={
              index >= 8
                ? 'hidden border-x border-white/6 lg:block'
                : index >= 4
                  ? 'hidden border-x border-white/6 md:block'
                  : 'border-x border-white/6'
            }
          />
        ))}
      </div>
    </div>
  );
}
