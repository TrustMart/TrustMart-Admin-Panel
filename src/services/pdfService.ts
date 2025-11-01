import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ParsedMandiData, MandiCategory } from './openaiService';

/**
 * Generate PDF from parsed mandi data using HTML-to-Canvas approach
 * This ensures perfect Urdu text rendering by converting HTML directly to PDF
 */
export const generateMandiPDF = async (data: ParsedMandiData): Promise<{ blob: Blob, filename: string }> => {
  try {
    // Create a temporary container for HTML content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.backgroundColor = '#FFFFFF';
    container.style.fontFamily = 'Arial, sans-serif';
    
    // Build HTML content with URDU ONLY
    let htmlContent = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #5D4037; font-size: 32px; margin: 10px 0; direction: rtl; font-family: 'Arial', sans-serif;">
          ${data.market}
        </h1>
        <h2 style="color: #8D6E63; font-size: 24px; margin: 10px 0; direction: rtl;">
          غلہ منڈی قیمت کی فہرست
        </h2>
      </div>
      
      <div style="margin-bottom: 20px; font-size: 16px; color: #8D6E63; direction: rtl; text-align: right;">
        <p style="margin: 8px 0;"><strong>منڈی:</strong> ${data.market}</p>
        <p style="margin: 8px 0;"><strong>تاریخ:</strong> ${data.date}</p>
        ${data.source ? `<p style="margin: 8px 0;"><strong>ذریعہ:</strong> ${data.source}</p>` : ''}
      </div>
      
      <hr style="border: none; border-top: 3px solid #FFD5A1; margin: 25px 0;" />
    `;
    
    // Add category tables - URDU ONLY
    data.categories.forEach((category) => {
      htmlContent += `
        <div style="margin-top: 30px; page-break-inside: avoid;">
          <h3 style="color: #5D4037; font-size: 20px; margin-bottom: 15px; direction: rtl; text-align: right; border-bottom: 2px solid #FFD5A1; padding-bottom: 8px;">
            ${category.category} (${category.items.length} اشیاء)
          </h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; direction: rtl;">
            <thead>
              <tr style="background-color: #FFD5A1;">
                <th style="padding: 12px; border: 2px solid #E0E0E0; text-align: right; font-size: 14px; color: #5D4037; direction: rtl;">مصنوعات کا نام</th>
                <th style="padding: 12px; border: 2px solid #E0E0E0; text-align: center; font-size: 14px; color: #5D4037;">قیمت</th>
                <th style="padding: 12px; border: 2px solid #E0E0E0; text-align: center; font-size: 14px; color: #5D4037;">وزن</th>
                <th style="padding: 12px; border: 2px solid #E0E0E0; text-align: right; font-size: 14px; color: #5D4037; direction: rtl;">تفصیلات</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      category.items.forEach((item, index) => {
        const priceText = item.price 
          ? `${item.price} روپے` 
          : `${item.priceMin}-${item.priceMax} روپے`;
        
        const details = [
          item.moisture ? `نمی: ${item.moisture}` : '',
          item.mixture ? `آمیزش: ${item.mixture}` : '',
          item.quality || ''
        ].filter(Boolean).join(' | ');
        
        const bgColor = index % 2 === 0 ? '#FFFFFF' : '#FEFCF8';
        
        htmlContent += `
          <tr style="background-color: ${bgColor};">
            <td style="padding: 10px; border: 1px solid #E0E0E0; font-size: 14px; color: #5D4037; text-align: right; direction: rtl; font-weight: 500;">${item.nameUrdu}</td>
            <td style="padding: 10px; border: 1px solid #E0E0E0; font-size: 13px; color: #8BC34A; text-align: center; font-weight: 600;">${priceText}</td>
            <td style="padding: 10px; border: 1px solid #E0E0E0; font-size: 13px; color: #5D4037; text-align: center;">${item.unit}</td>
            <td style="padding: 10px; border: 1px solid #E0E0E0; font-size: 12px; color: #8D6E63; text-align: right; direction: rtl;">${details || '-'}</td>
          </tr>
        `;
      });
      
      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    });
    
    // Add footer - Urdu
    htmlContent += `
      <div style="margin-top: 40px; text-align: center; font-size: 11px; color: #8D6E63; border-top: 2px solid #FFD5A1; padding-top: 15px; direction: rtl;">
        <div>PakRiceMarket ایڈمن پینل کی طرف سے تیار کیا گیا</div>
        <div style="margin-top: 5px;">${new Date().toLocaleDateString('ur-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    `;
    
    container.innerHTML = htmlContent;
    document.body.appendChild(container);
    
    // Convert HTML to canvas with high quality
    const canvas = await html2canvas(container, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF'
    });
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm
    
    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add more pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Generate filename
    const filename = `Mandi-List-${data.date.replace(/\./g, '-')}.pdf`;
    
    // Get PDF as Blob
    const blob = pdf.output('blob');
    return { blob, filename };
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Generate preview data for display (before PDF generation)
 */
export const generatePreviewData = (data: ParsedMandiData) => {
  const totalItems = data.categories.reduce((sum, cat) => sum + cat.items.length, 0);
  
  return {
    totalCategories: data.categories.length,
    totalItems,
    estimatedPages: Math.ceil(totalItems / 15), // Rough estimate
    fileSize: '~200KB' // Rough estimate
  };
};

// AWS S3 config for Mandi PDFs
export const S3_MANDI_CONFIG = {
  bucketName: process.env.REACT_APP_S3_BUCKET_NAME || 'pakricebucket',
  region: process.env.REACT_APP_S3_REGION || 'ap-south-1',
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY || '',
  folder: 'mandi-pdfs/',
  baseUrl: 'https://pakricebucket.s3.ap-south-1.amazonaws.com/mandi-pdfs/'
};


