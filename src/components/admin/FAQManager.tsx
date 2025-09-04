import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSupabaseFAQ, FAQ } from '@/hooks/useSupabaseFAQ';
import { useToast } from '@/hooks/use-toast';
import { runFAQMigration } from '@/utils/migrateFAQData';
import { Download } from 'lucide-react';
import FAQList from './FAQList';
import FAQForm from './FAQForm';

const FAQManager: React.FC = () => {
  const { createFAQ, updateFAQ, deleteFAQ, getAllFAQsForAdmin } = useSupabaseFAQ();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | undefined>();
  const [deletingFAQId, setDeletingFAQId] = useState<string | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const { toast } = useToast();

  const loadFAQs = async () => {
    setLoading(true);
    const data = await getAllFAQsForAdmin();
    setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  const handleSubmit = async (data: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingFAQ) {
      await updateFAQ(editingFAQ.id, data);
    } else {
      await createFAQ(data);
    }
    
    setIsFormOpen(false);
    setEditingFAQ(undefined);
    loadFAQs();
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingFAQ(undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteFAQ(id);
    setDeletingFAQId(null);
    loadFAQs();
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingFAQ(undefined);
  };

  const handleMigration = async () => {
    setMigrationLoading(true);
    const result = await runFAQMigration();
    
    if (result.success) {
      toast({
        title: "Migracja zakończona",
        description: `Przeniesiono ${result.count} pytań FAQ do bazy danych`,
      });
      loadFAQs(); // Refresh the list
    } else {
      toast({
        title: "Błąd migracji",
        description: "Nie udało się przenieść danych FAQ",
        variant: "destructive",
      });
    }
    setMigrationLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Zarządzanie FAQ</CardTitle>
              <CardDescription>
                Dodawaj, edytuj i zarządzaj pytaniami FAQ w różnych językach
              </CardDescription>
            </div>
            {faqs.length === 0 && !loading && (
              <Button
                onClick={handleMigration}
                disabled={migrationLoading}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>{migrationLoading ? 'Migracja...' : 'Migruj FAQ'}</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FAQList
            faqs={faqs}
            onEdit={handleEdit}
            onDelete={(id) => setDeletingFAQId(id)}
            onAdd={handleAdd}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            loading={loading}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? 'Edytuj FAQ' : 'Dodaj nowe FAQ'}
            </DialogTitle>
            <DialogDescription>
              {editingFAQ 
                ? 'Zaktualizuj pytanie i odpowiedź FAQ' 
                : 'Dodaj nowe pytanie i odpowiedź do FAQ'
              }
            </DialogDescription>
          </DialogHeader>
          <FAQForm
            faq={editingFAQ}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingFAQId} onOpenChange={() => setDeletingFAQId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdź usunięcie</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć to FAQ? Ta akcja nie może być cofnięta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFAQId && handleDelete(deletingFAQId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FAQManager;