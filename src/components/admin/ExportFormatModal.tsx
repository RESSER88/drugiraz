import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Image, Loader2 } from 'lucide-react';

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: () => void;
  onExportJPG: () => void;
  isExportingPDF: boolean;
  isExportingJPG: boolean;
}

const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  isOpen,
  onClose,
  onExportPDF,
  onExportJPG,
  isExportingPDF,
  isExportingJPG
}) => {
  const isExporting = isExportingPDF || isExportingJPG;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eksport stanu magazynu</DialogTitle>
          <DialogDescription>
            Wybierz format eksportu listy magazynowej. Raport będzie zawierał wszystkie kluczowe informacje o produktach.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Button
            onClick={onExportPDF}
            disabled={isExporting}
            variant="outline"
            className="h-auto p-4 justify-start"
          >
            <div className="flex items-center gap-3">
              {isExportingPDF ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-5 w-5 text-red-600" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {isExportingPDF ? 'Generowanie PDF...' : 'Eksport do PDF'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Dokument PDF z tabelą produktów (orientacja pozioma)
                </div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={onExportJPG}
            disabled={isExporting}
            variant="outline"
            className="h-auto p-4 justify-start"
          >
            <div className="flex items-center gap-3">
              {isExportingJPG ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Image className="h-5 w-5 text-blue-600" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {isExportingJPG ? 'Generowanie JPG...' : 'Eksport do JPG'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Obraz JPG z wysoką jakością wydruku
                </div>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportFormatModal;