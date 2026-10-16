import { Section, SectionEyebrow } from '@/components/layout/Section';
import { RenderPicture } from '@/components/media/RenderPicture';
import { Reveal } from '@/components/motion/Reveal';
import type { Project, ProjectImage, Stat } from '@/data/types';
import { cn } from '@/lib/cn';
import { formatInteger } from '@/lib/format';
import { statCellClasses, statGridClasses } from './stat-grid';

interface ProjectIntroSectionProps {
  readonly project: Project;
}

/**
 * Gallery: a large frame (8 columns) and a narrower one (4 columns) sharing the same top and bottom
 * edges on desktop; the narrow image is cropped to fill the row. Below 1024px the second image is a
 * 4:3 crop offset on the grid.
 */
const GALLERY_LAYOUT = [
  { className: 'col-span-full lg:col-span-8', sizes: '(min-width: 64rem) 66vw, 100vw', fillsRow: false },
  {
    className: 'col-span-full md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-auto',
    sizes: '(min-width: 64rem) 33vw, (min-width: 48rem) 75vw, 100vw',
    fillsRow: true,
  },
] as const;

export function ProjectIntroSection({ project }: ProjectIntroSectionProps) {
  const [lead, ...rest] = project.intro.paragraphs;

  return (
    <Section id="projekti" labelledBy="projekti-titulli">
      <div className="page-grid gap-y-8">
        <Reveal className="col-span-full lg:col-span-7">
          <SectionEyebrow index="01" label="Projekti" />
          <h2 id="projekti-titulli" className="mt-8 text-heading">
            {project.intro.heading}
          </h2>
        </Reveal>

        <Reveal
          delay={120}
          className="col-span-full md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9 lg:pt-24"
        >
          {lead ? <p className="text-lead">{lead}</p> : null}
          {rest.map((paragraph) => (
            <p key={paragraph} className="mt-6 text-ink-muted">
              {paragraph}
            </p>
          ))}
        </Reveal>
      </div>

      <Reveal className="mt-section-sm">
        <ProjectFacts stats={project.stats} />
      </Reveal>

      {project.gallery.length > 0 ? (
        <div className="mt-section-sm page-grid gap-y-12">
          {project.gallery.slice(0, GALLERY_LAYOUT.length).map((image, index) => {
            const layout = GALLERY_LAYOUT[index];
            return (
              <Reveal key={image.image.original} delay={index * 120} className={layout?.className}>
                <GalleryFigure
                  image={image}
                  index={index}
                  sizes={layout?.sizes ?? '100vw'}
                  fillsRow={layout?.fillsRow ?? false}
                />
              </Reveal>
            );
          })}
        </div>
      ) : null}
    </Section>
  );
}

function ProjectFacts({ stats }: { readonly stats: readonly Stat[] }) {
  return (
    <dl className={statGridClasses(3)}>
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className={cn('flex flex-col-reverse justify-end gap-3 py-6 lg:py-8', statCellClasses(index, 3))}
        >
          <dt className="text-small text-ink-muted">{stat.label}</dt>
          <dd className="text-subheading tabular-nums lg:text-[2rem] lg:leading-none">
            {formatInteger(stat.value)}
            {stat.unit ? <span className="ml-1.5 text-small text-ink-muted">{stat.unit}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface GalleryFigureProps {
  readonly image: ProjectImage;
  readonly index: number;
  readonly sizes: string;
  /** Crop the image to fill its grid row, so it shares top and bottom edges with its neighbour (desktop). */
  readonly fillsRow: boolean;
}

function GalleryFigure({ image, index, sizes, fillsRow }: GalleryFigureProps) {
  return (
    <figure className="flex h-full flex-col">
      {fillsRow ? (
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:flex-1">
          <RenderPicture
            image={image.image}
            alt={image.alt}
            sizes={sizes}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      ) : (
        <RenderPicture image={image.image} alt={image.alt} sizes={sizes} className="h-auto w-full" />
      )}
      {image.caption ? (
        <figcaption className="mt-4 flex gap-4 text-caption text-ink-muted">
          <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
          <span>{image.caption}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
