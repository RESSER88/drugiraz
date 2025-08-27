import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Image, Upload, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMigrationMonitor } from '@/hooks/useMigrationMonitor';

interface ImageStatusTableProps {
  products: any[];
  isMonitoring: boolean;
  completeMigration: () => void;
}

const ImageStatusTable: React.FC<ImageStatusTableProps> = ({ 
  products, 
  isMonitoring, 
  completeMigration 
}) => {
  const { stats: migrationStats } = useMigrationMonitor(products || []);

  const statusData = [
    {
      label: 'Obrazy ogółem',
      value: migrationStats.totalImages,
      icon: Image,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: 'Obrazy Base64',
      value: migrationStats.base64Images,
      icon: AlertTriangle,
      color: 'orange',
      bgColor: 'bg-orange-50', 
      textColor: 'text-orange-700'
    },
    {
      label: 'W Supabase Storage',
      value: migrationStats.storageImages,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Status obrazów
        </CardTitle>
        <CardDescription>
          Podgląd statusu przechowywania obrazów produktów
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Typ</TableHead>
                <TableHead className="text-right">Liczba</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${item.bgColor}`}>
                          <Icon className={`h-4 w-4 ${item.textColor}`} />
                        </div>
                        <span className="font-medium">{item.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-2xl font-bold">{item.value}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.label === 'Obrazy Base64' && item.value > 0 ? (
                        <Badge variant="destructive">Wymagana migracja</Badge>
                      ) : item.label === 'W Supabase Storage' && item.value > 0 ? (
                        <Badge variant="default">Zoptymalizowane</Badge>
                      ) : (
                        <Badge variant="secondary">-</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Migration Button */}
        {migrationStats.base64Images > 0 && (
          <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-800">
                  Migracja obrazów wymagana
                </div>
                <div className="text-sm text-yellow-700">
                  {migrationStats.base64Images} obrazów oczekuje na przeniesienie do Storage
                </div>
              </div>
            </div>
            
            <Button 
              onClick={completeMigration}
              disabled={isMonitoring}
              variant="default"
              size="sm"
            >
              {isMonitoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Migracja...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uruchom migrację
                </>
              )}
            </Button>
          </div>
        )}

        {/* Success Message */}
        {migrationStats.isCompleted && (
          <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-semibold text-green-800">
                Migracja ukończona!
              </div>
              <div className="text-sm text-green-700">
                Wszystkie obrazy są przechowywane w Supabase Storage
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageStatusTable;