import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ExternalLink } from 'lucide-react';

interface BlockedContentPlaceholderProps {
  message?: string;
  height?: string;
  showIcon?: boolean;
}

const BlockedContentPlaceholder = ({ 
  message = "Ten element został zablokowany ze względów bezpieczeństwa",
  height = "h-32",
  showIcon = true
}: BlockedContentPlaceholderProps) => {
  return (
    <div className={`${height} w-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg bg-muted/10`}>
      <Alert variant="info" className="border-none shadow-none bg-transparent max-w-sm">
        {showIcon && <Shield className="h-4 w-4" />}
        <AlertDescription className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            {showIcon && <ExternalLink className="h-3 w-3" />}
            {message}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default BlockedContentPlaceholder;