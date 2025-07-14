
import jsPDF from 'jspdf';
import { Product } from '@/types';

interface QuoteData {
  product: Product;
  netPrice?: number;
  transportPrice?: number;
  clientName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  leasingAvailable?: boolean;
  additionalNotes?: string;
}

// Funkcja do pobierania i liczenia numerów ofert
const getNextQuoteNumber = (): string => {
  const currentYear = new Date().getFullYear();
  const storageKey = `quote_counter_${currentYear}`;
  
  let counter = parseInt(localStorage.getItem(storageKey) || '0');
  counter += 1;
  
  localStorage.setItem(storageKey, counter.toString());
  
  return `${counter.toString().padStart(3, '0')}/${currentYear}`;
};

// Funkcja do formatowania daty
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Funkcja do formatowania ceny
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

// Funkcja do obsługi polskich znaków
const handlePolishText = (text: string): string => {
  return text
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/Ą/g, 'A')
    .replace(/Ć/g, 'C')
    .replace(/Ę/g, 'E')
    .replace(/Ł/g, 'L')
    .replace(/Ń/g, 'N')
    .replace(/Ó/g, 'O')
    .replace(/Ś/g, 'S')
    .replace(/Ź/g, 'Z')
    .replace(/Ż/g, 'Z');
};

export const generatePDFQuote = async (data: QuoteData): Promise<void> => {
  const { 
    product, 
    netPrice, 
    transportPrice, 
    clientName, 
    companyName, 
    email, 
    phone, 
    address,
    paymentMethod,
    leasingAvailable,
    additionalNotes
  } = data;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Kolory minimalistyczne
  const primaryColor = '#111827'; // Ciemny szary
  const lightGray = '#F9FAFB'; // Bardzo jasny szary
  const borderColor = '#E5E7EB'; // Szara ramka
  
  // Daty
  const today = new Date();
  const validUntil = new Date();
  validUntil.setDate(today.getDate() + 14);
  
  const quoteNumber = getNextQuoteNumber();
  
  // === NAGŁÓWEK FIRMY (dwukolumnowy układ) ===
  
  // Lewa strona - dane firmy
  doc.setFontSize(14);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText('FHU STAKERPOL'), 15, 20);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(handlePolishText('Michał Seweryn'), 15, 25);
  doc.text(handlePolishText('32-043 Skała, ul. Szewska 6'), 15, 29);
  doc.text('NIP: PL6492111954', 15, 33);
  doc.text('Tel: +48 694 133 592', 15, 37);
  doc.text('E-mail: info@stakerpol.pl', 15, 41);
  
  // Prawa strona - numer oferty i daty
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText(`OFERTA ${quoteNumber}`), pageWidth - 15, 20, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(handlePolishText(`Data wystawienia: ${formatDate(today)}`), pageWidth - 15, 27, { align: 'right' });
  doc.text(handlePolishText(`Wazna do: ${formatDate(validUntil)}`), pageWidth - 15, 31, { align: 'right' });
  
  // Linia oddzielająca nagłówek
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, 45, pageWidth - 15, 45);
  
  let yPos = 55;
  
  // === DANE KLIENTA (jeśli wypełnione) ===
  
  const hasClientData = clientName || companyName || email || phone || address;
  
  if (hasClientData) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(handlePolishText('DLA KLIENTA'), 15, yPos);
    
    // Linia pod nagłówkiem
    doc.setDrawColor(borderColor);
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    let clientYPos = yPos + 8;
    
    if (clientName) {
      doc.setFont('helvetica', 'bold');
      doc.text(handlePolishText(clientName), 15, clientYPos);
      doc.setFont('helvetica', 'normal');
      clientYPos += 4;
    }
    
    if (companyName) {
      doc.text(handlePolishText(companyName), 15, clientYPos);
      clientYPos += 4;
    }
    
    if (email) {
      doc.text(`E-mail: ${email}`, 15, clientYPos);
      clientYPos += 4;
    }
    
    if (phone) {
      doc.text(`Tel: ${handlePolishText(phone)}`, 15, clientYPos);
      clientYPos += 4;
    }
    
    if (address) {
      const addressLines = address.split('\n');
      addressLines.forEach((line, index) => {
        if (line.trim()) {
          doc.text(handlePolishText(line.trim()), 15, clientYPos + (index * 4));
        }
      });
      clientYPos += addressLines.length * 4;
    }
    
    yPos = clientYPos + 10;
  }
  
  // === SPECYFIKACJA TECHNICZNA ===
  
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText('SPECYFIKACJA TECHNICZNA'), 15, yPos);
  
  // Linia pod nagłówkiem
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.3);
  doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  
  yPos += 10;
  
  // Przygotowanie danych specyfikacji - MODEL JAKO PIERWSZY
  const specs = [
    { label: 'Model', value: product.model },
    { label: 'Numer seryjny', value: product.specs.serialNumber },
    { label: 'Rok produkcji', value: product.specs.productionYear },
    { label: 'Udzwig (maszt)', value: product.specs.mastLiftingCapacity ? `${product.specs.mastLiftingCapacity} kg` : '' },
    { label: 'Udzwig (wstepny)', value: product.specs.preliminaryLiftingCapacity ? `${product.specs.preliminaryLiftingCapacity} kg` : '' },
    { label: 'Godziny pracy', value: product.specs.workingHours ? `${product.specs.workingHours} mh` : '' },
    { label: 'Wys. podnoszenia', value: product.specs.liftHeight ? `${product.specs.liftHeight} mm` : '' },
    { label: 'Wys. konstrukcyjna', value: product.specs.minHeight ? `${product.specs.minHeight} mm` : '' },
    { label: 'Wymiary', value: product.specs.dimensions },
    { label: 'Podest operatora', value: product.specs.operatorPlatform },
    { label: 'Produkt uzywany', value: 'Tak' } // Zawsze na końcu
  ].filter(spec => spec.value && spec.value.trim() !== '');
  
  // Tabela specyfikacji z czarnymi ramkami
  doc.setFontSize(9);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'normal');
  
  const tableStartY = yPos;
  const cellHeight = 6;
  const col1Width = 80;
  
  // Górna ramka tabeli
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.5);
  doc.line(15, tableStartY, pageWidth - 15, tableStartY);
  
  specs.forEach((spec, index) => {
    const currentY = tableStartY + (index * cellHeight);
    
    // Linie tabeli
    doc.setDrawColor('#000000');
    doc.setLineWidth(0.3);
    
    // Linia pionowa oddzielająca kolumny
    doc.line(15 + col1Width, currentY, 15 + col1Width, currentY + cellHeight);
    
    // Linie poziome
    doc.line(15, currentY + cellHeight, pageWidth - 15, currentY + cellHeight);
    
    // Linie boczne tabeli
    doc.line(15, currentY, 15, currentY + cellHeight);
    doc.line(pageWidth - 15, currentY, pageWidth - 15, currentY + cellHeight);
    
    // Tekst w komórkach
    doc.setFont('helvetica', 'bold');
    doc.text(handlePolishText(`${spec.label}:`), 17, currentY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(handlePolishText(spec.value), 17 + col1Width, currentY + 4);
  });
  
  yPos = tableStartY + (specs.length * cellHeight) + 15;
  
  // === WARUNKI HANDLOWE (jeśli są) ===
  
  const hasPricing = netPrice || transportPrice;
  const hasBusinessTerms = paymentMethod || leasingAvailable;
  
  if (hasPricing || hasBusinessTerms) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(handlePolishText('WARUNKI HANDLOWE'), 15, yPos);
    
    // Linia pod nagłówkiem
    doc.setDrawColor(borderColor);
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'normal');
    
    if (netPrice) {
      doc.setFont('helvetica', 'bold');
      doc.text(handlePolishText(`Cena netto: ${formatPrice(netPrice)} PLN`), 15, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
    }
    
    if (transportPrice) {
      doc.setFont('helvetica', 'bold');
      doc.text(handlePolishText(`Transport: ${formatPrice(transportPrice)} PLN`), 15, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 5;
    }
    
    if (paymentMethod) {
      doc.text(handlePolishText(`Forma platnosci: ${paymentMethod}`), 15, yPos);
      yPos += 5;
    }
    
    if (leasingAvailable) {
      doc.text(handlePolishText('Mozliwosc leasingu'), 15, yPos);
      yPos += 5;
    }
    
    doc.text(handlePolishText(`Waznosc oferty: ${formatDate(validUntil)}`), 15, yPos);
    yPos += 10;
  }
  
  // === UWAGI DODATKOWE (jeśli są) ===
  
  if (additionalNotes && additionalNotes.trim()) {
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text(handlePolishText('UWAGI DODATKOWE'), 15, yPos);
    
    // Linia pod nagłówkiem
    doc.setDrawColor(borderColor);
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
    
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'normal');
    
    const noteLines = doc.splitTextToSize(handlePolishText(additionalNotes), pageWidth - 30);
    noteLines.forEach((line: string, index: number) => {
      doc.text(line, 15, yPos + (index * 4));
    });
    
    yPos += noteLines.length * 4 + 10;
  }
  
  // === STOPKA KONTAKTOWA ===
  
  const footerY = Math.max(yPos + 15, pageHeight - 35);
  
  // Linia nad stopką
  doc.setDrawColor(borderColor);
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  // Dwukolumnowa stopka
  doc.setFontSize(10);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'normal');
  
  // Lewa strona - zachęta do kontaktu
  doc.text(handlePolishText('W razie pytan zapraszam do kontaktu:'), 15, footerY + 2);
  doc.text(handlePolishText('Jestesmy do Panstwa dyspozycji!'), 15, footerY + 7);
  
  // Prawa strona - dane kontaktowe
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText('Michal Seweryn'), pageWidth - 15, footerY + 2, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('+48 694 133 592', pageWidth - 15, footerY + 7, { align: 'right' });
  doc.text('info@stakerpol.pl', pageWidth - 15, footerY + 12, { align: 'right' });
  
  // Mała stopka z URL
  doc.setFontSize(8);
  doc.setTextColor('#888888');
  doc.text('www.stakerpol.pl', pageWidth / 2, footerY + 18, { align: 'center' });
  
  // Zapisanie i pobranie pliku
  const fileName = handlePolishText(`Oferta_${quoteNumber.replace('/', '_')}_${product.model.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  doc.save(fileName);
};
