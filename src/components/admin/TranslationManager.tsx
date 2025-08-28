import React from 'react';
import TranslationManagementPanel from './TranslationManagementPanel';
import ProductTranslationPanel from './ProductTranslationPanel';

const TranslationManager: React.FC = () => {

  return (
    <div className="space-y-6">
      {/* New Dual-API Translation Management */}
      <TranslationManagementPanel />
      
      {/* Product-Specific Translation Panel */}
      <ProductTranslationPanel />
    </div>
  );
};

export default TranslationManager;