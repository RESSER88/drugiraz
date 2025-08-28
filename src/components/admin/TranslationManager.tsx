import React from 'react';
import EnhancedTranslationPanel from './EnhancedTranslationPanel';

const TranslationManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Enhanced Translation Management with Queue Processing */}
      <EnhancedTranslationPanel />
    </div>
  );
};

export default TranslationManager;