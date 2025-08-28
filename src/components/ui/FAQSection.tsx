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
          <Accordion type="single" collapsible className="space-y-2">
            {items.map((qa, idx) => (
              <AccordionItem 
                key={idx} 
                value={`faq-${idx}`}
                className="border rounded-lg px-6 py-2 hover:bg-muted/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-4 hover:no-underline">
                  {qa.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
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
