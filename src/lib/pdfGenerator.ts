import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Proposal } from '@/types';
import { formatCurrency } from './subsidyCalc';

export async function generateProposalPDF(customer: Partial<Customer>, proposal: Partial<Proposal>) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [11, 7, 215]; // #0B07D7
  const accentColor: [number, number, number] = [3, 14, 69]; // #030E45
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

  try {
    // 1. Vector Blue Bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // 2. Proportional Logo
    const logoImg = await loadImage('/backround-blue-white-logo.png');
    const ratio = logoImg.height / logoImg.width;
    const displayWidth = 70;
    const displayHeight = displayWidth * ratio;
    const x = (pageWidth - displayWidth) / 2;
    const y = (35 - displayHeight) / 2;
    
    doc.addImage(logoImg, 'PNG', x, y, displayWidth, displayHeight);
  } catch (e) {
    console.error('Logo failed to load', e);
  }

  // Company Name (Below Blue Bar)
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NAHA ENERGY SOLUTIONS', margin, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('MNRE Approved | KSEB Grid Connect System | Kerala', margin, 56);

  // Customer & Project Info
  autoTable(doc, {
    startY: 65,
    head: [['Customer Details', 'Project Overview']],
    body: [
      [`Name: ${customer.name}`, `Project ID: ${customer.project_id}`],
      [`Address: ${customer.address}`, `Date: ${new Date().toLocaleDateString('en-IN')}`],
      [`Phone: ${customer.phone}`, `System Capacity: ${customer.system_kw} KW`],
    ],
    theme: 'plain',
    margin: { bottom: 30 },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    headStyles: { fillColor: [248, 249, 254], textColor: primaryColor, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section Header
  const addHeader = (text: string, y: number) => {
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 3, 6, 'F');
    doc.setFontSize(11);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin + 6, y + 5);
    return y + 10;
  };

  currentY = addHeader('SYSTEM COMPONENTS', currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Component', 'Specification', 'Warranty', 'Qty']],
    body: [
      ['Solar Module', `${customer.panel_brand} Half Cut Mono Perc`, '30 Year', 'Req'],
      ['Grid Tie Inverter', `${customer.inverter_brand} (ISO Certified)`, '10 Year', '1'],
      ['Surge Protection', 'AC/DC Type 2 Protection', '1 Year', 'Req'],
      ['Solar Meter', 'Single/Three Phase Bi-Directional', '5 Year', '1'],
      ['Structure', 'GI High Grade Mounting Structure', '10 Year', 'Req'],
      ['Cables', 'Solar DC 4/6mm & AC Armoured', '10 Year', 'Req'],
    ],
    styles: { fontSize: 8.5, cellPadding: 4.5, font: 'helvetica' },
    margin: { bottom: 30 },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], halign: 'left' },
    alternateRowStyles: { fillColor: [252, 252, 255] },
    columnStyles: { 0: { fontStyle: 'bold' }, 2: { halign: 'center' }, 3: { halign: 'center' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  currentY = addHeader('FINANCIAL SUMMARY', currentY);

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Actual Project Cost', formatCurrency(customer.actual_cost || 0)],
      ['Central Subsidy (Approx)', `- ${formatCurrency(customer.subsidy || 0)}`],
      ['Net Cost to Customer', { content: formatCurrency(customer.net_cost || 0), styles: { fontStyle: 'bold', fontSize: 11 } }],
    ],
    theme: 'grid',
    margin: { bottom: 30 },
    styles: { fontSize: 9.5, cellPadding: 5 },
    columnStyles: { 
      0: { cellWidth: 100, fontStyle: 'bold', fillColor: [250, 250, 250] },
      1: { halign: 'right', textColor: primaryColor } 
    },
    didParseCell: (data) => {
      if (data.row.index === 1 && data.column.index === 1) data.cell.styles.textColor = [0, 150, 0];
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Footer / Terms
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Notes & Bank Details:', margin, currentY);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const notes = [
    '• Includes installation, structure, KSEB charges and net metering approval.',
    '• Performance warranty on panels: 25-30 years | AMC: 5 years free.',
    '• Bank: ICICI Bank | A/C: 0942 0500 0938 | IFSC: ICIC0000942',
    '• Payment: 50% Advance | 40% Delivery | 10% Commissioning.'
  ];
  notes.forEach((note, i) => {
    doc.text(note, margin, currentY + 6 + (i * 5));
  });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Page border line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text('nahaenergysolutions | www.nahaenergysolutions.com', pageWidth / 2, pageHeight - 13, { align: 'center' });
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 13, { align: 'right' });
  }

  doc.save(`${(customer.name || 'Proposal').replace(/\s+/g, '_')}.pdf`);
}
