
import { Card, CardContent } from "@/components/ui/card";
import { Testimonial } from "@/types";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg animate-fade-in border-none rounded-lg shadow">
      <CardContent className="p-6">
        <div className="flex mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${i < testimonial.rating ? 'text-stakerpol-orange' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          ))}
        </div>
        <blockquote className="text-lg italic mb-5">"{testimonial.content}"</blockquote>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-stakerpol-navy text-white flex items-center justify-center font-bold shadow-md">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-stakerpol-navy">{testimonial.name}</p>
            {testimonial.company && (
              <p className="text-sm text-muted-foreground">{testimonial.company}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
