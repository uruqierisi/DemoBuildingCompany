import { BuildingSelectorSection } from '@/components/home/BuildingSelectorSection';
import { CompanySection } from '@/components/home/CompanySection';
import { ContactSection } from '@/components/home/ContactSection';
import { ProjectHero } from '@/components/home/ProjectHero';
import { ProjectIntroSection } from '@/components/home/ProjectIntroSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject } from '@/hooks/useProject';

export function HomePage() {
  const project = useProject();
  usePageMeta({ description: `${project.name} nga Pozhegu Brothers. ${project.tagline}` });

  return (
    <>
      <ProjectHero project={project} />
      <ProjectIntroSection project={project} />
      <BuildingSelectorSection project={project} />
      <CompanySection projectName={project.name} />
      {/* Company figures first, then the people behind them, then the call to action. */}
      <TestimonialsSection />
      <ContactSection projectName={project.name} />
    </>
  );
}
