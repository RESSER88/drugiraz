import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImprovedTranslationPanel from './ImprovedTranslationPanel';
import { TranslationSystemTester } from './TranslationSystemTester';
import TranslationTestRunner from './TranslationTestRunner';
import MassTranslationMigrator from './MassTranslationMigrator';

const TranslationManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="management" className="w-full">
        <TabsList>
          <TabsTrigger value="management">Zarządzanie Tłumaczeniami</TabsTrigger>
          <TabsTrigger value="testing">Diagnostyka Systemu</TabsTrigger>
          <TabsTrigger value="realtest">Test Rzeczywisty</TabsTrigger>
          <TabsTrigger value="migration">Masowa Migracja</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management">
          <ImprovedTranslationPanel />
        </TabsContent>
        
        <TabsContent value="testing">
          <TranslationSystemTester />
        </TabsContent>
        
        <TabsContent value="realtest">
          <TranslationTestRunner />
        </TabsContent>
        
        <TabsContent value="migration">
          <MassTranslationMigrator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationManager;