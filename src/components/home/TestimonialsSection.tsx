import { Section, SectionEyebrow } from '@/components/layout/Section';
import { Reveal } from '@/components/motion/Reveal';
import { TESTIMONIALS, type Testimonial } from '@/config/testimonials';

/**
 * Client testimonials, set typographically: one featured quote at display size, the rest as
 * columns on hairlines. No carousel and no quote icons; the Albanian quotation marks „ “ hang
 * outside the text block.
 */
export function TestimonialsSection() {
  const [featured, ...others] = TESTIMONIALS;
  if (!featured) return null;

  return (
    <Section id="klientet" labelledBy="klientet-titulli">
      <Reveal>
        <SectionEyebrow index="04" label="Klientët" />
        <h2 id="klientet-titulli" className="mt-8 text-heading">
          Fjala e klientëve.
        </h2>
      </Reveal>

      <Reveal className="mt-section-sm page-grid">
        <figure className="col-span-full lg:col-span-9 lg:col-start-3">
          <blockquote className="text-quote">
            <QuoteText text={featured.quote} />
          </blockquote>
          <Attribution testimonial={featured} />
        </figure>
      </Reveal>

      {others.length > 0 ? (
        <div className="mt-section-sm page-grid gap-y-12">
          {others.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 120} className="col-span-full md:col-span-4">
              <figure className="border-t border-line pt-8">
                <blockquote className="max-w-[46ch]">
                  <QuoteText text={testimonial.quote} />
                </blockquote>
                <Attribution testimonial={testimonial} />
              </figure>
            </Reveal>
          ))}
        </div>
      ) : null}
    </Section>
  );
}

/** Quote wrapped in Albanian quotation marks, the opening mark hanging into the margin. */
function QuoteText({ text }: { readonly text: string }) {
  return (
    <p>
      <span aria-hidden="true" className="-ml-[0.45em] inline-block w-[0.45em] text-accent-ink">
        „
      </span>
      {text}
      <span aria-hidden="true" className="text-accent-ink">
        “
      </span>
    </p>
  );
}

function Attribution({ testimonial }: { readonly testimonial: Testimonial }) {
  return (
    <figcaption className="mt-8 flex items-center gap-4 text-small">
      <span aria-hidden="true" className="h-px w-8 bg-ink/40" />
      <span className="font-medium">{testimonial.name}</span>
    </figcaption>
  );
}
