import { Section, SectionEyebrow } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { COMPANY_STATS } from '@/config/company';
import { SITE } from '@/config/site';
import { statCellClasses, statGridClasses } from './stat-grid';
import { StatCounter } from './StatCounter';

interface CompanySectionProps {
  readonly projectName: string;
}

/** The developer behind the project, with Pozhegu's published company figures. */
export function CompanySection({ projectName }: CompanySectionProps) {
  return (
    <Section id="kompania" labelledBy="kompania-titulli" tone="white">
      <div className="page-grid gap-y-8">
        <Reveal className="col-span-full lg:col-span-6">
          <SectionEyebrow index="03" label={SITE.company} />
          <h2 id="kompania-titulli" className="mt-8 text-heading">
            Ndërtuesi pas {projectName}.
          </h2>
        </Reveal>
        <Reveal
          delay={120}
          className="col-span-full md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-9 lg:pt-20"
        >
          <p className="text-lead">
            {SITE.company} ndërton banesa, lokale dhe shtëpi. Këto janë shifrat e kompanisë deri më sot.
          </p>
        </Reveal>
      </div>

      <dl className={`mt-section-sm ${statGridClasses(4)}`}>
        {COMPANY_STATS.map((stat, index) => (
          <StatCounter key={stat.id} stat={stat} className={`py-8 lg:py-10 ${statCellClasses(index, 4)}`} />
        ))}
      </dl>
    </Section>
  );
}
