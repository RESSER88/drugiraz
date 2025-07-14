
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Product } from '@/types';

// Funkcja do formatowania daty
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
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

export const exportProductListToPDF = async (products: Product[]): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const today = new Date();
  
  // Nagłówek dokumentu
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText('LISTA MAGAZYNOWA PRODUKTOW'), pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(handlePolishText(`Data wygenerowania: ${formatDate(today)}`), pageWidth / 2, 28, { align: 'center' });
  doc.text(handlePolishText(`Liczba produktow: ${products.length}`), pageWidth / 2, 34, { align: 'center' });
  
  // Linia oddzielająca
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.5);
  doc.line(15, 42, pageWidth - 15, 42);
  
  let yPos = 52;
  const lineHeight = 6;
  const maxLinesPerPage = 40;
  let currentLine = 0;
  
  // Nagłówki tabeli
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nr', 15, yPos);
  doc.text('Model', 25, yPos);
  doc.text('Numer seryjny', 90, yPos);
  doc.text('Rok prod.', 140, yPos);
  doc.text('Stan', 170, yPos);
  
  // Linia pod nagłówkami
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.3);
  doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  
  yPos += 8;
  currentLine += 2;
  
  // Lista produktów
  doc.setFont('helvetica', 'normal');
  products.forEach((product, index) => {
    // Sprawdź czy trzeba przejść na nową stronę
    if (currentLine >= maxLinesPerPage) {
      doc.addPage();
      yPos = 20;
      currentLine = 0;
    }
    
    const serialNumber = product.specs.serialNumber || 'Brak';
    const productionYear = product.specs.productionYear || 'Brak';
    const condition = product.specs.condition || 'Brak';
    
    doc.text(`${index + 1}`, 15, yPos);
    doc.text(handlePolishText(product.model.substring(0, 35)), 25, yPos);
    doc.text(handlePolishText(serialNumber.substring(0, 25)), 90, yPos);
    doc.text(handlePolishText(productionYear), 140, yPos);
    doc.text(handlePolishText(condition.substring(0, 15)), 170, yPos);
    
    yPos += lineHeight;
    currentLine++;
  });
  
  // Stopka
  const footerY = doc.internal.pageSize.height - 20;
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  doc.text('FHU STAKERPOL - www.stakerpol.pl', pageWidth / 2, footerY, { align: 'center' });
  
  // Zapisanie pliku
  const fileName = handlePolishText(`Lista_magazynowa_${formatDate(today).replace(/\./g, '_')}.pdf`);
  doc.save(fileName);
};

export const exportProductListToJPG = async (products: Product[]): Promise<void> => {
  // Utworzenie tymczasowego elementu HTML z tabelą
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '1200px';
  tempDiv.style.padding = '20px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  const today = new Date();
  
  tempDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; margin: 0; color: #111827;">LISTA MAGAZYNOWA PRODUKTÓW</h1>
      <p style="font-size: 14px; margin: 10px 0; color: #666;">Data wygenerowania: ${formatDate(today)}</p>
      <p style="font-size: 14px; margin: 0; color: #666;">Liczba produktów: ${products.length}</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">Nr</th>
          <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">Model</th>
          <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">Numer seryjny</th>
          <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">Rok produkcji</th>
          <th style="border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: bold; font-size: 12px;">Stan</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((product, index) => `
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px;">${index + 1}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px;">${product.model}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px;">${product.specs.serialNumber || 'Brak'}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px;">${product.specs.productionYear || 'Brak'}</td>
            <td style="border: 1px solid #dee2e6; padding: 8px; font-size: 11px;">${product.specs.condition || 'Brak'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="text-align: center; margin-top: 30px;">
      <p style="font-size: 12px; color: #888;">FHU STAKERPOL - www.stakerpol.pl</p>
    </div>
  `;
  
  document.body.appendChild(tempDiv);
  
  try {
    const canvas = await html2canvas(tempDiv, {
      backgroundColor: 'white',
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    // Konwersja canvas do blob i pobranie
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Lista_magazynowa_${formatDate(today).replace(/\./g, '_')}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.9);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
