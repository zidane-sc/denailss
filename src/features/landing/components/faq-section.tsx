import { Reveal } from "@/components/motion/reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BOOKING_FAQ, SERVICE_FAQ } from "@/features/landing/data/faq.mock";

export function FaqSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-lg">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Pertanyaan yang sering ditanyakan
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <p className="text-sm font-semibold text-foreground">Seputar Booking</p>
            <Accordion className="mt-3">
              {BOOKING_FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`booking-${i}`}>
                  <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-sm font-semibold text-foreground">Seputar Layanan</p>
            <Accordion className="mt-3">
              {SERVICE_FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`service-${i}`}>
                  <AccordionTrigger className="text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
