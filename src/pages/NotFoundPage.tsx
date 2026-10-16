import { StatusMessage } from '@/components/feedback/StatusMessage';
import { SectionLink } from '@/components/layout/SectionLink';
import { buttonClasses } from '@/components/ui/button-styles';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { usePageMeta } from '@/hooks/usePageMeta';

export function NotFoundPage() {
  usePageMeta({ title: 'Faqja nuk u gjet' });

  return (
    <StatusMessage
      eyebrow="Gabim 404"
      title="Faqja nuk u gjet"
      body="Adresa mund të jetë e pasaktë, ose faqja është zhvendosur. Vazhdoni nga faqja kryesore ose zgjidhni një objekt."
      actions={
        <>
          <ButtonLink to="/" variant="dark" withArrow>
            Faqja kryesore
          </ButtonLink>
          <SectionLink sectionId="objektet" className={buttonClasses('outline')}>
            Shiko objektet
          </SectionLink>
        </>
      }
    />
  );
}
