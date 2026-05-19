import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DetailedProposalData {
  // Section 1 - Client Info
  clientName: string;
  designation: string;
  address: string;
  mobileNumber: string;
  date: string;
  projectId: string;
  locationCoordinates: string;

  // Section 2 - System Integrator
  companyName: string;
  provinceState: string;
  companyAddress: string;
  projectEngineerName: string;
  engineerDesignation: string;
  email: string;
  contactNumber: string;

  // Section 3 - Products
  products: Array<{
    name: string;
    brand: string;
    specification: string;
    warranty: string;
    quantity: string;
  }>;

  // Section 4 - Cost Details
  totalProjectCost: string;
  avgDailyEnergy: string;
  avgOutputPerKw: string;
  requiredAreaPerKw: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
  branch: string;

  // Section 5 - Warranty
  solarModuleWarranty: string;
  inverterWarranty: string;
  acdbDcdbWarranty: string;
  surgeProtectorWarranty: string;

  // Section 7 - Signature
  authorisedSignatory: string;
  signatureDate: string;
  remarks: string;
}

export async function generateDetailedProposalPDF(data: DetailedProposalData) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [11, 7, 215]; // #0B07D7
  const secondaryColor: [number, number, number] = [67, 67, 249]; // #4343F9
  const accentColor: [number, number, number] = [3, 14, 69]; // #030E45
  const lightGray = [245, 245, 245];
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper for image loading
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  let brandedHeader: HTMLImageElement | null = null;
  let footerImg: HTMLImageElement | null = null;

  try {
    brandedHeader = await loadImage('/backround-blue-white-logo.png');
  } catch (e) {
    console.error('Logo image failed to load', e);
  }

  try {
    footerImg = await loadImage('/solar-footer.jpeg');
  } catch (e) {
    console.error('Footer image failed to load', e);
  }

  try {
    // 1. Sharp Vector Blue Bar (No pixelation)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 40, 'F');

    if (brandedHeader) {
      // 2. Add Logo (Centered and Proportionally scaled)
      // Calculate aspect ratio to avoid stretching
      const imgWidth = brandedHeader.width;
      const imgHeight = brandedHeader.height;
      const ratio = imgHeight / imgWidth;

      // Target size (Logo should occupy about 50-60% of the bar width)
      const displayWidth = 80;
      const displayHeight = displayWidth * ratio;

      // Center it in the 40mm high bar
      const x = (pageWidth - displayWidth) / 2;
      const y = (40 - displayHeight) / 2;

      doc.addImage(brandedHeader, 'PNG', x, y, displayWidth, displayHeight);
    }
  } catch (e) {
    console.error('Logo image could not be drawn', e);
  }

  // Company Info (Below Blue Bar)
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'NAHA ENERGY SOLUTIONS', pageWidth - margin, 55, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const companyInfo = [
    data.companyAddress || 'Solar Power Solutions',
    data.email || '',
    data.contactNumber || ''
  ].filter(Boolean);
  doc.text(companyInfo, pageWidth - margin, 62, { align: 'right', lineHeightFactor: 1.5 });

  // Divider
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, 82, pageWidth - margin, 82);

  // Section Header Helper
  const addSectionHeader = (text: string, y: number) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 25;
    }

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 3, 7, 'F');

    doc.setFontSize(11);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin + 7, y + 5.5);

    doc.setDrawColor(240);
    doc.setLineWidth(0.2);
    doc.line(margin, y + 10, pageWidth - margin, y + 10);

    return y + 18;
  };

  // Section 1: Client Information
  let currentY = 95;
  currentY = addSectionHeader('CLIENT INFORMATION', currentY);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Client Name', data.clientName, 'Date', data.date],
      ['Designation', data.designation, 'Project ID', data.projectId],
      ['Address', data.address, 'Coordinates', data.locationCoordinates],
      ['Mobile', data.mobileNumber, '', ''],
    ],
    theme: 'plain',
    margin: { bottom: 30 },
    styles: { fontSize: 9, cellPadding: 3, textColor: [60, 60, 60], font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: primaryColor },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, textColor: primaryColor },
      3: { cellWidth: 55 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Section 2: Technical Specifications
  currentY = addSectionHeader('SYSTEM COMPONENTS & SPECIFICATIONS', currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Component', 'Brand / Specification', 'Warranty', 'Qty']],
    body: data.products.map(p => [p.name, p.brand + '\n' + p.specification, p.warranty, p.quantity]),
    styles: { fontSize: 8.5, cellPadding: 5, font: 'helvetica', valign: 'middle' },
    margin: { bottom: 50 }, // Prevent overlap with footer
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 80 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'center', cellWidth: 20 }
    },
    alternateRowStyles: { fillColor: [252, 252, 255] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Section 3: Financial Details
  currentY = addSectionHeader('FINANCIAL SUMMARY', currentY);

  const parsedCost = parseFloat(data.totalProjectCost.replace(/[^0-9.]/g, '')) || 0;
  const formattedCost = 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parsedCost);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Total Project Cost', { content: formattedCost, styles: { fontStyle: 'bold', fontSize: 15, textColor: primaryColor } }],
    ],
    theme: 'grid',
    margin: { bottom: 50 },
    styles: { fontSize: 11, cellPadding: 8, font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120, fillColor: [240, 244, 255] },
      1: { halign: 'right', fontStyle: 'bold', textColor: primaryColor, fontSize: 15 }
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text('* Inclusive of all Taxes, Structure, Installation & KSEB Charges', margin, (doc as any).lastAutoTable.finalY + 8);

  currentY = (doc as any).lastAutoTable.finalY + 25;

  // Warranty & Terms
  currentY = addSectionHeader('WARRANTY & SERVICE TERMS', currentY);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Solar PV Modules', data.solarModuleWarranty || '25-30 Years Performance Warranty'],
      ['Grid-Tie Inverter', data.inverterWarranty || '5-10 Years Standard Warranty'],
      ['ACDB / DCDB & Surge Protection', data.acdbDcdbWarranty || '1-5 Years Warranty'],
      ['Workmanship & Maintenance', '5 Years Comprehensive Maintenance'],
    ],
    theme: 'plain',
    margin: { bottom: 50 },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60, textColor: primaryColor },
      1: { cellWidth: 110, textColor: [80, 80, 80] }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 30;

  // Signature Section
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 40;
  }

  doc.setDrawColor(200);
  doc.setLineWidth(0.5);

  // Left: Authorized Signatory
  doc.line(margin, currentY + 15, margin + 60, currentY + 15);
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.authorisedSignatory || 'Authorised Signatory', margin, currentY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('Naha Energy Solutions', margin, currentY + 26);

  // Right: Client Signature
  const rightSignX = pageWidth - margin - 60;
  doc.line(rightSignX, currentY + 15, pageWidth - margin, currentY + 15);
  doc.setFontSize(9);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Acceptance', rightSignX, currentY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('Signature & Seal', rightSignX, currentY + 26);

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Page border line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 48, pageWidth - margin, pageHeight - 48);

    // Banner image at bottom (centered)
    if (footerImg) {
      try {
        const bannerW = pageWidth - 2 * margin; // 170mm
        const bannerH = 35; // clean height
        const bannerY = pageHeight - 42;
        doc.addImage(footerImg, 'PNG', margin, bannerY, bannerW, bannerH);
      } catch (e) {
        console.error('Footer image failed to add', e);
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 44, { align: 'right' });
  }

  // Save the PDF
  doc.save(`${data.clientName.replace(/\s+/g, '_')}_Proposal.pdf`);
}
