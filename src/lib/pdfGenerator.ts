import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Customer, Proposal } from '@/types';
import { formatCurrency } from './subsidyCalc';

export function generateProposalPDF(customer: Partial<Customer>, proposal: Partial<Proposal>) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [0, 71, 255]; // #0047FF

  // Header
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('NAHA ENERGY SOLUTIONS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('MNRE Approved | KSEB Grid Connect System | Kerala', 105, 28, { align: 'center' });
  
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.line(20, 35, 190, 35);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Proposal for ${customer.system_kw} KW Grid-Tie Solar Power Plant`, 20, 45);

  // Customer Details
  autoTable(doc, {
    startY: 55,
    head: [['Customer Details', 'Project Info']],
    body: [
      [`Name: ${customer.name}`, `Project ID: ${customer.project_id}`],
      [`Address: ${customer.address}`, `Date: ${new Date().toLocaleDateString('en-IN')}`],
      [`Phone: ${customer.phone}`, `System Capacity: ${customer.system_kw} KW`],
      ['District: ' + (customer.district || 'N/A'), `Daily Output: ${proposal.daily_output_min}-${proposal.daily_output_max} Units`],
    ],
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0], fontStyle: 'bold' }
  });

  // Products Table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('System Components & Specifications', 20, finalY);

  autoTable(doc, {
    startY: finalY + 5,
    head: [['Product', 'Brand / Specification', 'Warranty', 'Qty']],
    body: [
      ['Solar Module', `${customer.panel_brand} (Half Cut Mono Perc Bifacial DCR)`, '30 Year', 'Req'],
      ['Grid Tie Inverter', `${customer.inverter_brand} (ISO Certified)`, '10 Year', '1'],
      ['AC Surge Protector', 'Phoenix Contact/Havells (Type 2)', '1 Year', '1'],
      ['DC Surge Protector', 'Citel/Mersen/Havells (600/1200V)', '1 Year', '2'],
      ['Solar Meter', 'Vision Tek/Secure/L&T (Single Phase)', '5 Year', '1'],
      ['Lightning Arrestor', '20MM x 1000MM Multi-Spike', '10 Year', '1'],
      ['Mounting Structure', 'GI&GP Apollo/Tata', '10 Year', 'Req'],
      ['Cables (AC/DC)', 'KBE/Polycab/Waaree (4/6MM)', '10 Year', 'Req'],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: primaryColor }
  });

  // Cost Breakdown
  const costY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('Financial Summary', 20, costY);

  autoTable(doc, {
    startY: costY + 5,
    body: [
      ['Actual Project Cost', formatCurrency(customer.actual_cost || 0)],
      ['Central Subsidy (PM Surya Ghar)', `- ${formatCurrency(customer.subsidy || 0)}`],
      ['Net Cost to Customer', { content: formatCurrency(customer.net_cost || 0), styles: { fontStyle: 'bold', fontSize: 12 } }],
    ],
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 
      1: { halign: 'right' } 
    },
    didParseCell: (data) => {
      if (data.row.index === 1 && data.column.index === 1) {
        data.cell.styles.textColor = [0, 128, 0];
      }
    }
  });

  // Footer & Terms
  const footerY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Notes & Warranty:', 20, footerY);
  doc.setFontSize(8);
  const notes = [
    '• Includes structure work, installation & KSEB Charges',
    '• Average Energy Production: 4 units per KW per sunny day',
    '• Required area: 80–100 sq ft per KW shade-free',
    '• 5 Years Free AMC included | Complaint resolution within 2 working days',
    '• Payment Terms: 50% advance, 40% after material supply, 10% on commissioning',
    '• Bank: ICICI Bank | Kottakkal | A/C: 0942 0500 0938 | IFSC: ICIC0000942'
  ];
  notes.forEach((note, i) => {
    doc.text(note, 20, footerY + 5 + (i * 5));
  });

  // Save the PDF
  doc.save(`Naha_Proposal_${customer.project_id}.pdf`);
}
