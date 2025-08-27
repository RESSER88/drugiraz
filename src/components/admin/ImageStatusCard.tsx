import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Image, Upload, Loader2, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import { useMigrationMonitor } from '@/hooks/useMigrationMonitor';

interface ImageStatusCardProps {
  products: any[];
  isMonitoring: boolean;
  completeMigration: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageStatusCard: React.FC<ImageStatusCardProps> = ({ 
  products, 
  isMonitoring, 
  completeMigration,
  isOpen,
  onOpenChange
}) => {
  const { stats: migrationStats } = useMigrationMonitor(products || []);

  const statusItems = [
    {
      label: 'Obrazy ogółem',
      value: migrationStats.totalImages,
      icon: Database,
      variant: 'secondary' as const
    },
    {
      label: 'Base64 (do migracji)',
      value: migrationStats.base64Images,
      icon: AlertTriangle,
      variant: migrationStats.base64Images > 0 ? 'destructive' as const : 'secondary' as const
    },
    {
      label: 'Storage (zoptymalizowane)',
      value: migrationStats.storageImages,
      icon: CheckCircle,
      variant: 'default' as const
    }
  ];

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Status obrazów</CardTitle>
                  <CardDescription>
                    Zarządzanie przechowywaniem obrazów produktów
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {migrationStats.base64Images > 0 && (
                  <Badge variant="destructive" className="mr-2">
                    {migrationStats.base64Images} do migracji
                  </Badge>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statusItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-2xl font-bold">{item.value}</div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                    <Badge variant={item.variant}>
                      {item.value > 0 ? 'Aktywne' : 'Brak'}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Migration Section */}
            {migrationStats.base64Images > 0 && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-semibold text-yellow-800">
                      Migracja obrazów wymagana
                    </div>
                    <div className="text-sm text-yellow-700">
                      {migrationStats.base64Images} obrazów oczekuje na przeniesienie do Supabase Storage
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={completeMigration}
                  disabled={isMonitoring}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isMonitoring ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Migracja...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uruchom ponownie
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Success Status */}
            {migrationStats.isCompleted && (
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">
                    Migracja ukończona!
                  </div>
                  <div className="text-sm text-green-700">
                    Wszystkie {migrationStats.storageImages} obrazów są zoptymalizowane w Supabase Storage
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ImageStatusCard;