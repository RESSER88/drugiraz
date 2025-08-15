import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';

interface RateLimitNoticeProps {
  retryAfter?: number; // seconds
  onRetry?: () => void;
  message?: string;
}

const RateLimitNotice = ({ 
  retryAfter = 60, 
  onRetry, 
  message = "Przekroczono limit żądań" 
}: RateLimitNoticeProps) => {
  const [countdown, setCountdown] = useState(retryAfter);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (countdown <= 0) {
      setCanRetry(true);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${secs}s`;
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Alert variant="warning">
        <Clock className="h-4 w-4" />
        <AlertTitle>{message}</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>
            Wykonano zbyt wiele żądań w krótkim czasie. 
            {!canRetry && (
              <span className="block mt-2">
                Spróbuj ponownie za: <strong>{formatTime(countdown)}</strong>
              </span>
            )}
          </p>
          
          {canRetry && (
            <Button size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Spróbuj teraz
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default RateLimitNotice;