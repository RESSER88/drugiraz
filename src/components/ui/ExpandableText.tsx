
import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

const ExpandableText = ({ text, maxLength = 250, className = "" }: ExpandableTextProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text || text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }
  
  const truncatedText = text.substring(0, maxLength);
  
  return (
    <div className={className}>
      <p className="leading-relaxed">
        {isExpanded ? text : `${truncatedText}...`}
        {!isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="ml-2 p-1 h-auto hover:bg-gray-100 rounded-full"
            aria-label="Rozwiń tekst"
          >
            <MoreHorizontal className="h-4 w-4 text-gray-500" />
          </Button>
        )}
      </p>
      {isExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Zwiń
        </Button>
      )}
    </div>
  );
};

export default ExpandableText;
