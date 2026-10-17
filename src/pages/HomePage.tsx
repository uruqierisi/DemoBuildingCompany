import { BuildingSelectorSection } from '@/components/home/BuildingSelectorSection';
import { ContactSection } from '@/components/home/ContactSection';
import { ProjectFiguresSection } from '@/components/home/ProjectFiguresSection';
import { ProjectHero } from '@/components/home/ProjectHero';
import { ProjectIntroSection } from '@/components/home/ProjectIntroSection';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProject } from '@/hooks/useProject';

export function HomePage() {
  const project = useProject();
  usePageMeta({ description: `${project.name}: ${project.description} ${project.tagline}` });

  return (
    <>
      <ProjectHero project={project} />
      <ProjectIntroSection project={project} />
      <BuildingSelectorSection project={project} />
      <ProjectFiguresSection project={project} />
      <ContactSection projectName={project.name} />
    </>
  );
}
