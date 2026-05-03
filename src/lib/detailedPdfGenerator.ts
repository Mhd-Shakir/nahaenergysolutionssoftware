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

export function generateDetailedProposalPDF(data: DetailedProposalData) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [0, 71, 255]; // #0047FF

  // Helper for section headers
  const addSectionHeader = (text: string, y: number) => {
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 20, y);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, y + 2, 190, y + 2);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    return y + 10;
  };

  // Header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyName || 'NAHA ENERGY SOLUTIONS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('SOLAR POWER PLANT PROPOSAL', 105, 28, { align: 'center' });
  
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(20, 35, 190, 35);

  // Section 1: Client Information
  let currentY = 45;
  currentY = addSectionHeader('SECTION 1: CLIENT INFORMATION', currentY);
  
  autoTable(doc, {
    startY: currentY,
    body: [
      ['Client Name:', data.clientName, 'Date:', data.date],
      ['Designation:', data.designation, 'Project ID:', data.projectId],
      ['Address:', data.address, 'Coordinates:', data.locationCoordinates],
      ['Mobile:', data.mobileNumber, '', ''],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', cellWidth: 30 },
      3: { cellWidth: 60 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: System Integrator
  currentY = addSectionHeader('SECTION 2: SYSTEM INTEGRATOR', currentY);
  
  autoTable(doc, {
    startY: currentY,
    body: [
      ['Company:', data.companyName, 'Province/State:', data.provinceState],
      ['Address:', data.companyAddress, 'Email:', data.email],
      ['Engineer:', data.projectEngineerName, 'Designation:', data.engineerDesignation],
      ['Contact:', data.contactNumber, '', ''],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 60 },
      2: { fontStyle: 'bold', cellWidth: 30 },
      3: { cellWidth: 60 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 3: Product Specifications
  currentY = addSectionHeader('SECTION 3: PRODUCT SPECIFICATIONS', currentY);
  
  autoTable(doc, {
    startY: currentY,
    head: [['Product', 'Brand', 'Specification', 'Warranty', 'Qty']],
    body: data.products.map(p => [p.name, p.brand, p.specification, p.warranty, p.quantity]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: primaryColor }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // Section 4: Cost Details
  currentY = addSectionHeader('SECTION 4: COST DETAILS', currentY);
  
  autoTable(doc, {
    startY: currentY,
    body: [
      ['Total Project Cost:', data.totalProjectCost],
      ['Avg. Daily Production:', data.avgDailyEnergy],
      ['Avg. Output per KW:', data.avgOutputPerKw],
      ['Required Area per KW:', data.requiredAreaPerKw],
    ],
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { halign: 'right' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Schedule:', 20, currentY + 5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('• 50% Advance with order', 25, currentY + 12);
  doc.text('• 40% After material supply at site', 25, currentY + 17);
  doc.text('• 10% On successful commissioning', 25, currentY + 22);

  currentY += 30;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Bank: ${data.bankName} | IFSC: ${data.ifscCode}`, 25, currentY + 7);
  doc.text(`Account: ${data.accountNumber} | Branch: ${data.branch}`, 25, currentY + 12);

  currentY += 25;

  // Section 5: Warranty
  currentY = addSectionHeader('SECTION 5: WARRANTY', currentY);
  
  autoTable(doc, {
    startY: currentY,
    body: [
      ['Solar Module:', data.solarModuleWarranty],
      ['Inverter:', data.inverterWarranty],
      ['ACDB / DCDB:', data.acdbDcdbWarranty],
      ['Surge Protector:', data.surgeProtectorWarranty],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 
      0: { fontStyle: 'bold', cellWidth: 40 },
      1: { cellWidth: 100 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 6: Terms & Conditions
  currentY = addSectionHeader('SECTION 6: TERMS & CONDITIONS', currentY);
  const terms = [
    '1. The proposal is valid for 15 days from the date of issue.',
    '2. Standard structure height is up to 1 meter from the roof level.',
    '3. Net metering approval is subject to KSEB feasibility.',
    '4. Any civil work apart from structure grouting is not included.',
    '5. Customer shall provide water and electricity during installation.'
  ];
  doc.setFontSize(8);
  terms.forEach((term, i) => {
    doc.text(term, 20, currentY + (i * 5));
  });

  currentY += (terms.length * 5) + 10;

  // Section 7: Signature
  currentY = addSectionHeader('SECTION 7: SIGNATURE & REMARKS', currentY);
  
  doc.setFontSize(9);
  doc.text(`Authorised Signatory: ${data.authorisedSignatory}`, 20, currentY + 5);
  doc.text(`Date: ${data.signatureDate}`, 150, currentY + 5);
  
  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Remarks:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.remarks || 'No additional remarks.', 20, currentY + 5, { maxWidth: 170 });

  // Save the PDF
  doc.save(`Proposal_${data.projectId || 'Draft'}.pdf`);
}
