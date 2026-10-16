import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { StatusMessage } from '@/components/feedback/StatusMessage';
import { buttonClasses } from '@/components/ui/button-styles';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { CONTACT, CONTACT_DETAILS_CONFIRMED } from '@/config/contact';
import { usePageMeta } from '@/hooks/usePageMeta';
import { NotFoundPage } from './NotFoundPage';

/** Route error boundary: 404 responses show the not-found page, anything else a recoverable error. */
export function RouteErrorPage() {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  if (isNotFound) return <NotFoundPage />;
  return <UnexpectedError error={error} />;
}

function UnexpectedError({ error }: { readonly error: unknown }) {
  usePageMeta({ title: 'Diçka nuk funksionoi' });

  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <StatusMessage
      eyebrow="Gabim"
      title="Diçka nuk funksionoi"
      body={`Faqja nuk u ngarkua si duhet. Rifreskoni faqen ose provoni sërish pas pak.${CONTACT_DETAILS_CONFIRMED ? ` Për ndihmë, telefononi zyrën e shitjes: ${CONTACT.phoneDisplay}.` : ''}`}
      actions={
        <>
          <button type="button" onClick={() => window.location.reload()} className={buttonClasses('dark')}>
            Rifresko faqen
          </button>
          <ButtonLink to="/" variant="outline">
            Faqja kryesore
          </ButtonLink>
        </>
      }
    />
  );
}
