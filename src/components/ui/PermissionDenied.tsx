import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PermissionDeniedProps {
  message?: string;
  showBackButton?: boolean;
  showContactButton?: boolean;
  contactEmail?: string;
}

const PermissionDenied = ({ 
  message = "Nie masz uprawnień do tej sekcji",
  showBackButton = true,
  showContactButton = true,
  contactEmail = "info@stakerpol.pl"
}: PermissionDeniedProps) => {
  return (
    <div className="p-6 max-w-md mx-auto">
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>Brak uprawnień</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{message}</p>
          <p className="text-sm">
            Jeśli uważasz, że to błąd, skontaktuj się z pomocą techniczną.
          </p>
          
          <div className="flex flex-col gap-2">
            {showBackButton && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Wróć do strony głównej
                </Link>
              </Button>
            )}
            
            {showContactButton && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = `mailto:${contactEmail}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Skontaktuj się z pomocą
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PermissionDenied;