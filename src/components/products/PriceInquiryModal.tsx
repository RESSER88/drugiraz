
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Mail, X } from 'lucide-react';
import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/utils/translations';

interface PriceInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const PriceInquiryModal = ({ isOpen, onClose, product }: PriceInquiryModalProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');

  const generateEmailContent = () => {
    const productDetails = [
      `${t('model')}: ${product.model}`,
      product.specs.productionYear && `${t('productionYear')}: ${product.specs.productionYear}`,
      product.specs.serialNumber && `${t('serialNumber')}: ${product.specs.serialNumber}`
    ].filter(Boolean).join('\n');

    const phoneInfo = phoneNumber ? `\n${t('yourPhone')}: ${phoneNumber}` : '';

    const messages = {
      pl: `Witam,

jestem zainteresowany produktem:

${productDetails}

Proszę o przesłanie oferty cenowej oraz informacji o dostępności.${phoneInfo}

Pozdrawiam`,
      en: `Hello,

I am interested in the product:

${productDetails}

Please send me a price quote and availability information.${phoneInfo}

Best regards`,
      cs: `Dobrý den,

zajímám se o produkt:

${productDetails}

Prosím o zaslání cenové nabídky a informací o dostupnosti.${phoneInfo}

S pozdravem`,
      sk: `Dobrý deň,

zaujímam sa o produkt:

${productDetails}

Prosím o zaslanie cenovej ponuky a informácií o dostupnosti.${phoneInfo}

S pozdravom`,
      de: `Hallo,

ich interessiere mich für das Produkt:

${productDetails}

Bitte senden Sie mir ein Preisangebot und Verfügbarkeitsinformationen.${phoneInfo}

Mit freundlichen Grüßen`
    };

    const polishVersion = language !== 'pl' ? `

---

Wersja w języku polskim:

Witam,

jestem zainteresowany produktem:

${productDetails}

Proszę o przesłanie oferty cenowej oraz informacji o dostępności.${phoneInfo}

Pozdrawiam` : '';

    return messages[language] + polishVersion;
  };

  const handleEmailRedirect = () => {
    const subject = encodeURIComponent(`${t('priceInquiry')} - ${product.model}`);
    const body = encodeURIComponent(generateEmailContent());
    const mailtoLink = `mailto:info@stakerpol.pl?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
    
    toast({
      title: t('success'),
      description: t('emailRedirectSuccess'),
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('askForPrice')}
          </DialogTitle>
          <DialogDescription>
            {t('emailRedirectDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{t('productModel')}:</h4>
            <p className="text-sm">{product.model}</p>
            {product.specs.productionYear && (
              <p className="text-sm mt-1">{t('productionYear')}: {product.specs.productionYear}</p>
            )}
            {product.specs.serialNumber && (
              <p className="text-sm mt-1">{t('serialNumber')}: {product.specs.serialNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              {t('phoneNumberOptional')}
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('phoneNumberPlaceholder')}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">{t('email')}:</h4>
            <p className="text-sm font-mono">info@stakerpol.pl</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleEmailRedirect}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('openEmailClient')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceInquiryModal;
