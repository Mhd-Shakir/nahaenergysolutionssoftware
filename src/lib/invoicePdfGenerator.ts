import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Invoice, Payment } from '@/types';

function formatPDFCurrency(amount: number): string {
  return 'Rs. ' + new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateInvoicePDF(
  customer: Partial<Customer>, 
  invoice: Partial<Invoice>, 
  payments: Partial<Payment>[] = [],
  action: 'download' | 'print' = 'download'
) {
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

  let bannerImg: HTMLImageElement | null = null;
  try {
    bannerImg = await loadImage('/solar-footer.png');
  } catch (e) {
    console.warn('Banner image failed to load', e);
  }

  const imageRatio = bannerImg ? (bannerImg.height / bannerImg.width) : (350 / 1000);
  const headerHeight = pageWidth * imageRatio;
  
  const lineY = pageHeight - 20;
  const pageNumY = lineY + 4;
  const tableBottomMargin = 25;

  try {
    if (bannerImg) {
      doc.addImage(bannerImg, 'PNG', 0, 0, pageWidth, headerHeight);
    }
  } catch (e) {
    console.error('Header drawing failed', e);
  }

  // Company Name
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, headerHeight + 15, { align: 'right' });
  
  doc.setFontSize(16);
  doc.text('NAHA ENERGY SOLUTIONS', margin, headerHeight + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('MNRE Approved | KSEB Grid Connect System | Kerala', margin, headerHeight + 16);

  // Customer & Invoice Info
  autoTable(doc, {
    startY: headerHeight + 25,
    head: [['Billed To', 'Invoice Details']],
    body: [
      [`Name: ${customer.name || 'N/A'}`, `Invoice #: ${invoice.invoice_number || 'INV-001'}`],
      [`Address: ${customer.address || 'N/A'}`, `Date: ${new Date(invoice.created_at || new Date()).toLocaleDateString('en-IN')}`],
      [`Phone: ${customer.phone || 'N/A'}`, `Status: ${(invoice.status || 'Pending').toUpperCase()}`],
      [`Project ID: ${customer.project_id || 'N/A'}`, `Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Immediate'}`],
    ],
    theme: 'plain',
    margin: { bottom: tableBottomMargin },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    headStyles: { fillColor: [248, 249, 254], textColor: primaryColor, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: 80 } }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section Header Function
  const addHeader = (text: string, y: number) => {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin + 10;
    }
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 3, 6, 'F');
    doc.setFontSize(11);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin + 6, y + 5);
    return y + 10;
  };

  currentY = addHeader('DESCRIPTION', currentY);

  autoTable(doc, {
    startY: currentY,
    head: [['Item Description', 'Qty', 'Rate', 'Amount']],
    body: [
      [`Solar PV System Installation (${customer.system_kw || 0} KW)`, '1', formatPDFCurrency(customer.actual_cost || 0), formatPDFCurrency(customer.actual_cost || 0)],
      [`Central Subsidy Discount`, '1', `- ${formatPDFCurrency(customer.subsidy || 0)}`, `- ${formatPDFCurrency(customer.subsidy || 0)}`],
    ],
    styles: { fontSize: 9, cellPadding: 4.5, font: 'helvetica' },
    margin: { bottom: tableBottomMargin },
    headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], halign: 'left' },
    alternateRowStyles: { fillColor: [252, 252, 255] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  currentY = addHeader('PAYMENT SUMMARY', currentY);

  const amount = invoice.amount || 0;
  const paid = invoice.paid_amount || 0;
  const balance = amount - paid;

  autoTable(doc, {
    startY: currentY,
    body: [
      ['Total Invoice Amount', formatPDFCurrency(amount)],
      ['Total Paid', formatPDFCurrency(paid)],
      ['Balance Due', { content: formatPDFCurrency(balance), styles: { fontStyle: 'bold', fontSize: 14 } }],
    ],
    theme: 'grid',
    margin: { bottom: tableBottomMargin },
    styles: { fontSize: 9.5, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 120, fontStyle: 'bold', fillColor: [250, 250, 250] },
      1: { halign: 'right', textColor: primaryColor }
    },
    didParseCell: (data) => {
      if (data.row.index === 1 && data.column.index === 1) data.cell.styles.textColor = [0, 150, 0];
      if (data.row.index === 2) {
        data.cell.styles.fillColor = [255, 240, 240]; // highlight background for balance
        if (data.column.index === 1) {
          data.cell.styles.fontSize = 14;
          data.cell.styles.textColor = [200, 0, 0]; // red for due
        }
        if (balance <= 0) {
            data.cell.styles.fillColor = [240, 255, 240];
            if (data.column.index === 1) data.cell.styles.textColor = [0, 150, 0];
        }
      }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  if (payments && payments.length > 0) {
    currentY = addHeader('PAYMENT HISTORY', currentY);
    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Method', 'Notes', 'Amount']],
      body: payments.map(p => [
        new Date(p.payment_date || '').toLocaleDateString('en-IN'),
        p.payment_method?.toUpperCase() || 'N/A',
        p.notes || '-',
        formatPDFCurrency(p.amount || 0)
      ]),
      styles: { fontSize: 8.5, cellPadding: 4, font: 'helvetica' },
      margin: { bottom: tableBottomMargin },
      headStyles: { fillColor: [200, 200, 220], textColor: [0,0,0] }
    });
    currentY = (doc as any).lastAutoTable.finalY + 12;
  } else {
      currentY += 5;
  }

  // Footer / Terms
  if (currentY > pageHeight - 35) {
    doc.addPage();
    currentY = margin + 10;
  }

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Bank Details:', margin, currentY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const notes = [
    'Bank: ICICI Bank | A/C: 0942 0500 0938 | IFSC: ICIC0000942',
    'Please include invoice number in payment remarks.'
  ];
  notes.forEach((note, i) => {
    doc.text(note, margin, currentY + 6 + (i * 5));
  });

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, lineY, pageWidth - margin, lineY);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text('Nahaenergysolutions | www.nahaenergysolutions.com', margin, pageNumY);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageNumY, { align: 'right' });
  }

  if (action === 'print') {
    doc.autoPrint();
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } else {
    doc.save(`${invoice.invoice_number}_${(customer.name || 'Invoice').replace(/\s+/g, '_')}.pdf`);
  }
}
