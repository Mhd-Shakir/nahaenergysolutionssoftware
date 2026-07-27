import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DetailedProposalData {
  // Section 1 - Client Info
  clientName: string;
  clientType: 'residential' | 'commercial';
  address: string;
  clientStateDistrict: string;
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
  advancePaid?: string;
  balanceAmount?: string;
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

  let bannerImg: HTMLImageElement | null = null;

  try {
    bannerImg = await loadImage('/solar-footer.png');
  } catch (e) {
    console.warn('Banner image failed to load', e);
  }

  // Calculate dynamic aspect ratios to prevent squishing / congestion
  const imageRatio = bannerImg ? (bannerImg.height / bannerImg.width) : (350 / 1000);
  const headerHeight = pageWidth * imageRatio;

  // Clean page-bottom layouts without footer image
  const lineY = pageHeight - 20; // divider line 20mm from page bottom
  const pageNumY = lineY + 4; // page num 4mm below divider line
  
  // Set table bottom margin to a standard clean buffer
  const tableBottomMargin = 25;

  try {
    if (bannerImg) {
      // Draw banner image at the top of the first page edge-to-edge
      doc.addImage(bannerImg, 'PNG', 0, 0, pageWidth, headerHeight);
    }
  } catch (e) {
    console.error('Banner drawing failed', e);
  }

  // Company Info (Below Banner - dynamically positioned!)
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'NAHA ENERGY SOLUTIONS', pageWidth - margin, headerHeight + 15, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const companyInfo = [
    data.companyAddress || 'Solar Power Solutions',
    data.email || '',
    data.contactNumber || ''
  ].filter(Boolean);
  doc.text(companyInfo, pageWidth - margin, headerHeight + 22, { align: 'right', lineHeightFactor: 1.5 });

  // Divider (dynamically positioned!)
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, headerHeight + 42, pageWidth - margin, headerHeight + 42);

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

  // Section 1: Client Information (dynamically positioned!)
  let currentY = headerHeight + 55;
  currentY = addSectionHeader('CLIENT INFORMATION', currentY);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Client Name', data.clientName, 'Date', data.date],
      ['Client Type', data.clientType === 'commercial' ? 'Commercial' : 'Residential', 'Project ID', data.projectId],
      ['Address', data.address, 'Coordinates', data.locationCoordinates],
      ['Mobile', data.mobileNumber, 'State/District', data.clientStateDistrict || ''],
    ],
    theme: 'plain',
    margin: { bottom: tableBottomMargin },
    styles: { fontSize: 9, cellPadding: 3, textColor: [60, 60, 60], font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26, textColor: primaryColor },
      1: { cellWidth: 59 },
      2: { fontStyle: 'bold', cellWidth: 26, textColor: primaryColor },
      3: { cellWidth: 59 }
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
    margin: { bottom: tableBottomMargin }, // Prevent overlap with footer
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

  const parsedAdvance = parseFloat((data.advancePaid || '').replace(/[^0-9.]/g, '')) || 0;
  const formattedAdvance = 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parsedAdvance);

  const parsedBalance = parseFloat((data.balanceAmount || '').replace(/[^0-9.]/g, '')) || (parsedCost - parsedAdvance);
  const formattedBalance = 'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(parsedBalance);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Total Project Cost', { content: formattedCost, styles: { fontStyle: 'bold', fontSize: 13, textColor: primaryColor } }],
      ['Advance Paid', { content: formattedAdvance, styles: { fontStyle: 'normal', fontSize: 11 } }],
      ['Balance Amount', { content: formattedBalance, styles: { fontStyle: 'bold', fontSize: 12, textColor: [180, 0, 0] } }],
    ],
    theme: 'grid',
    margin: { bottom: tableBottomMargin },
    styles: { fontSize: 11, cellPadding: 8, font: 'helvetica' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120, fillColor: [240, 244, 255] },
      1: { halign: 'right', fontStyle: 'bold', textColor: primaryColor, fontSize: 13 }
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
    margin: { bottom: tableBottomMargin },
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
    doc.line(margin, lineY, pageWidth - margin, lineY);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text('Nahaenergysolutions | www.nahaenergysolutions.com', margin, pageNumY);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageNumY, { align: 'right' });
  }

  // Save the PDF
  doc.save(`${data.clientName.replace(/\s+/g, '_')}_Proposal.pdf`);
}
