import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  items: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ title = 'Najczęstsze pytania (FAQ)', items }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="section-padding bg-white" aria-labelledby="faq-heading">
      <div className="container-custom">
        <h2 id="faq-heading" className="section-title text-center">{title}</h2>
        <div className="max-w-3xl mx-auto mt-6">
          <Accordion type="single" collapsible>
            {items.map((qa, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left">
                  {qa.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">{qa.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
