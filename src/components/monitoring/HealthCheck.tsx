import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface HealthStatus {
  status: string;
  timestamp: string;
  database_version: string;
  products_count: number;
  inquiries_count: number;
  uptime_check: boolean;
}

interface SecurityAudit {
  timestamp: string;
  rls_enabled_tables: number;
  total_tables: number;
  rls_coverage_percent: number;
  security_status: 'secure' | 'mostly_secure' | 'needs_attention';
}

const HealthCheck = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [security, setSecurity] = useState<SecurityAudit | null>(null);
  const { toast } = useToast();

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      // Sprawdzenie zdrowia systemu
      const { data: healthData, error: healthError } = await supabase
        .rpc('health_check');

      if (healthError) throw healthError;

      // Audyt bezpieczeństwa
      const { data: securityData, error: securityError } = await supabase
        .rpc('security_audit');

      if (securityError) throw securityError;

      setHealth(healthData as unknown as HealthStatus);
      setSecurity(securityData as unknown as SecurityAudit);

      toast({
        title: "Health Check Completed",
        description: "System status updated successfully",
      });
    } catch (error) {
      console.error('Health check failed:', error);
      toast({
        title: "Health Check Failed",
        description: "Could not retrieve system status",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getSecurityStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'mostly_secure':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Health & Security</h2>
        <Button onClick={runHealthCheck} disabled={isChecking}>
          {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Health Check
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {health && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <span className="capitalize text-green-600">{health.status}</span>
                
                <span className="font-medium">Products:</span>
                <span>{health.products_count}</span>
                
                <span className="font-medium">Inquiries:</span>
                <span>{health.inquiries_count}</span>
                
                <span className="font-medium">Last Check:</span>
                <span>{new Date(health.timestamp).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {security && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSecurityStatusIcon(security.security_status)}
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-medium">RLS Coverage:</span>
                <span>{security.rls_coverage_percent}%</span>
                
                <span className="font-medium">Protected Tables:</span>
                <span>{security.rls_enabled_tables}/{security.total_tables}</span>
                
                <span className="font-medium">Status:</span>
                <span className={`capitalize ${
                  security.security_status === 'secure' ? 'text-green-600' :
                  security.security_status === 'mostly_secure' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {security.security_status.replace('_', ' ')}
                </span>
                
                <span className="font-medium">Last Audit:</span>
                <span>{new Date(security.timestamp).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!health && !security && !isChecking && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Click "Run Health Check" to view system status
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthCheck;