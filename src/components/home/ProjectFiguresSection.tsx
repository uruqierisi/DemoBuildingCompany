import { useMemo } from 'react';
import { Section, SectionEyebrow } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import type { Project } from '@/data/types';
import { deriveProjectTotals } from '@/lib/inventory';
import { statCellClasses, statGridClasses } from './stat-grid';
import { StatCounter } from './StatCounter';

interface ProjectFiguresSectionProps {
  readonly project: Project;
}

/** The whole project in figures, derived from the inventory (sold apartments included). */
export function ProjectFiguresSection({ project }: ProjectFiguresSectionProps) {
  const totals = useMemo(() => deriveProjectTotals(project.buildings), [project.buildings]);

  return (
    <Section id="shifrat" labelledBy="shifrat-titulli" tone="white">
      <div className="page-grid gap-y-8">
        <Reveal className="col-span-full lg:col-span-6">
          <SectionEyebrow index="03" label="Në shifra" />
          <h2 id="shifrat-titulli" className="mt-8 text-heading">
            {project.name} në shifra.
          </h2>
        </Reveal>
        <Reveal
          delay={120}
          className="col-span-full md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9 lg:pt-20"
        >
          <p className="text-lead">
            I gjithë projekti, përfshirë banesat e shitura. Shifrat llogariten drejtpërdrejt nga lista e banesave.
          </p>
        </Reveal>
      </div>

      <dl className={`mt-section-sm ${statGridClasses(4)}`}>
        {totals.map((stat, index) => (
          <StatCounter key={stat.id} stat={stat} className={`py-8 lg:py-10 ${statCellClasses(index, 4)}`} />
        ))}
      </dl>
    </Section>
  );
}
