
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
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const today = new Date();
  
  // Nagłówek dokumentu
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(handlePolishText('STAN MAGAZYNU - RAPORT'), pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(handlePolishText(`Data wygenerowania: ${formatDate(today)}`), pageWidth / 2, 28, { align: 'center' });
  doc.text(handlePolishText(`Liczba produktow: ${products.length}`), pageWidth / 2, 34, { align: 'center' });
  
  // Linia oddzielająca
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.5);
  doc.line(15, 40, pageWidth - 15, 40);
  
  let yPos = 50;
  const lineHeight = 8;
  const maxLinesPerPage = Math.floor((pageHeight - 80) / lineHeight);
  let currentLine = 0;
  
  // Pozycje kolumn (dostosowane do poziomego układu)
  const cols = {
    nr: 15,
    model: 25,
    serial: 85,
    year: 120,
    mastCap: 140,
    prelCap: 170,
    hours: 200,
    liftHeight: 225,
    minHeight: 255,
    battery: 275
  };
  
  // Nagłówki tabeli
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Nr', cols.nr, yPos);
  doc.text('Model', cols.model, yPos);
  doc.text('Nr seryjny', cols.serial, yPos);
  doc.text('Rok', cols.year, yPos);
  doc.text('Udzwig M', cols.mastCap, yPos);
  doc.text('Udzwig W', cols.prelCap, yPos);
  doc.text('Godz', cols.hours, yPos);
  doc.text('Wys.P', cols.liftHeight, yPos);
  doc.text('Wys.K', cols.minHeight, yPos);
  doc.text('Bateria', cols.battery, yPos);
  
  // Linia pod nagłówkami
  doc.setDrawColor('#000000');
  doc.setLineWidth(0.3);
  doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
  
  yPos += 10;
  currentLine += 2;
  
  // Lista produktów
  doc.setFont('helvetica', 'normal');
  products.forEach((product, index) => {
    // Sprawdź czy trzeba przejść na nową stronę
    if (currentLine >= maxLinesPerPage) {
      doc.addPage('l');
      yPos = 20;
      currentLine = 0;
      
      // Powtórz nagłówki na nowej stronie
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Nr', cols.nr, yPos);
      doc.text('Model', cols.model, yPos);
      doc.text('Nr seryjny', cols.serial, yPos);
      doc.text('Rok', cols.year, yPos);
      doc.text('Udzwig M', cols.mastCap, yPos);
      doc.text('Udzwig W', cols.prelCap, yPos);
      doc.text('Godz', cols.hours, yPos);
      doc.text('Wys.P', cols.liftHeight, yPos);
      doc.text('Wys.K', cols.minHeight, yPos);
      doc.text('Bateria', cols.battery, yPos);
      
      doc.setDrawColor('#000000');
      doc.setLineWidth(0.3);
      doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);
      
      yPos += 10;
      currentLine += 2;
      doc.setFont('helvetica', 'normal');
    }
    
    const serialNumber = product.specs.serialNumber || 'Brak';
    const productionYear = product.specs.productionYear || 'Brak';
    const mastCapacity = product.specs.mastLiftingCapacity || '0';
    const prelCapacity = product.specs.preliminaryLiftingCapacity || '0';
    const workingHours = product.specs.workingHours || '0';
    const liftHeight = product.specs.liftHeight || '0';
    const minHeight = product.specs.minHeight || '0';
    const battery = product.specs.battery || 'Brak';
    
    doc.setFontSize(7);
    doc.text(`${index + 1}`, cols.nr, yPos);
    doc.text(handlePolishText(product.model.substring(0, 25)), cols.model, yPos);
    doc.text(handlePolishText(serialNumber.substring(0, 15)), cols.serial, yPos);
    doc.text(handlePolishText(productionYear), cols.year, yPos);
    doc.text(handlePolishText(mastCapacity.substring(0, 8)), cols.mastCap, yPos);
    doc.text(handlePolishText(prelCapacity.substring(0, 8)), cols.prelCap, yPos);
    doc.text(handlePolishText(workingHours.substring(0, 8)), cols.hours, yPos);
    doc.text(handlePolishText(liftHeight.substring(0, 8)), cols.liftHeight, yPos);
    doc.text(handlePolishText(minHeight.substring(0, 8)), cols.minHeight, yPos);
    doc.text(handlePolishText(battery.substring(0, 12)), cols.battery, yPos);
    
    yPos += lineHeight;
    currentLine++;
  });
  
  // Stopka
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor('#666666');
  doc.text('FHU STAKERPOL - www.stakerpol.pl', pageWidth / 2, footerY, { align: 'center' });
  
  // Zapisanie pliku
  const fileName = handlePolishText(`Stan_magazynu_${formatDate(today).replace(/\./g, '_')}.pdf`);
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
      <h1 style="font-size: 24px; margin: 0; color: #111827;">STAN MAGAZYNU - RAPORT</h1>
      <p style="font-size: 14px; margin: 10px 0; color: #666;">Data wygenerowania: ${formatDate(today)}</p>
      <p style="font-size: 14px; margin: 0; color: #666;">Liczba produktów: ${products.length}</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px;">
      <thead>
        <tr style="background-color: #f8f9fa;">
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Nr</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Model</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Nr seryjny</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Rok</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Udźwig M</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Udźwig W</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Godz</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Wys.P</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Wys.K</th>
          <th style="border: 1px solid #dee2e6; padding: 8px 4px; text-align: left; font-weight: bold;">Bateria</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((product, index) => `
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${index + 1}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.model}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.serialNumber || 'Brak'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.productionYear || 'Brak'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.mastLiftingCapacity || '0'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.preliminaryLiftingCapacity || '0'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.workingHours || '0'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.liftHeight || '0'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.minHeight || '0'}</td>
            <td style="border: 1px solid #dee2e6; padding: 6px 4px; font-size: 9px;">${product.specs.battery || 'Brak'}</td>
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
        link.download = `Stan_magazynu_${formatDate(today).replace(/\./g, '_')}.jpg`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/jpeg', 0.9);
  } finally {
    document.body.removeChild(tempDiv);
  }
};
