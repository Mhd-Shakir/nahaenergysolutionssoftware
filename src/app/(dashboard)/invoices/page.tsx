'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Customer, Invoice, Payment, InvoiceStatus } from '@/types';
import { formatCurrency } from '@/lib/subsidyCalc';
import { generateInvoicePDF } from '@/lib/invoicePdfGenerator';
import { 
  Search, 
  Filter, 
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Download,
  Printer,
  CreditCard,
  XCircle,
  User,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

type InvoiceWithCustomer = Invoice & { customers: Customer };

const STATUS_OPTIONS: InvoiceStatus[] = ['pending', 'partial', 'paid', 'overdue'];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Payment Modal State
  const [recordingPaymentFor, setRecordingPaymentFor] = useState<InvoiceWithCustomer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const toast = useToast();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchInvoices();
  }, [supabase]);

  async function fetchInvoices() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data as InvoiceWithCustomer[] || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  }

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const searchStr = search.toLowerCase();
      const matchesSearch = 
        inv.invoice_number.toLowerCase().includes(searchStr) || 
        (inv.customers?.name && inv.customers.name.toLowerCase().includes(searchStr));
      
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const handleDelete = async (id: string) => {
    const originalInvoices = [...invoices];
    setInvoices(prev => prev.filter(c => c.id !== id));

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Invoice successfully deleted!');
    } catch (err: any) {
      setInvoices(originalInvoices);
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleDownloadPDF = async (invoice: InvoiceWithCustomer, action: 'download' | 'print' = 'download') => {
    try {
      // Fetch payments for this invoice
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoice.id)
        .order('payment_date', { ascending: true });

      await generateInvoicePDF(invoice.customers, invoice, payments || [], action);
      if (action === 'download') {
        toast.success('PDF downloaded successfully!');
      }
    } catch (err) {
      toast.error('Error generating PDF');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recordingPaymentFor) return;

    const amountNum = parseFloat(paymentAmount) || 0;
    const discountNum = parseFloat(discountAmount) || 0;
    
    if (amountNum <= 0 && discountNum <= 0) {
      toast.error('Please enter a valid payment or discount amount');
      return;
    }

    const currentPaid = recordingPaymentFor.paid_amount || 0;
    const totalAmount = recordingPaymentFor.amount;
    const totalDeduction = amountNum + discountNum;
    const newPaidAmount = currentPaid + totalDeduction;
    
    if (newPaidAmount > totalAmount) {
        toast.error('Total deduction exceeds balance due!');
        return;
    }

    const newStatus: InvoiceStatus = newPaidAmount >= totalAmount ? 'paid' : 'partial';

    setIsSubmittingPayment(true);
    try {
      // 1. Insert Payment(s)
      const paymentsToInsert = [];
      if (amountNum > 0) {
        paymentsToInsert.push({
          invoice_id: recordingPaymentFor.id,
          amount: amountNum,
          payment_method: paymentMethod,
          notes: paymentNotes
        });
      }
      if (discountNum > 0) {
        paymentsToInsert.push({
          invoice_id: recordingPaymentFor.id,
          amount: discountNum,
          payment_method: 'discount',
          notes: 'Discount applied'
        });
      }

      if (paymentsToInsert.length > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert(paymentsToInsert);

        if (paymentError) throw paymentError;
      }

      // 2. Update Invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus
        })
        .eq('id', recordingPaymentFor.id);

      if (invoiceError) throw invoiceError;

      toast.success('Payment recorded successfully!');
      
      // Update local state
      setInvoices(prev => prev.map(inv => {
          if (inv.id === recordingPaymentFor.id) {
              return { ...inv, paid_amount: newPaidAmount, status: newStatus };
          }
          return inv;
      }));
      
      setRecordingPaymentFor(null);
      setPaymentAmount('');
      setDiscountAmount('');
      setPaymentNotes('');
    } catch (err: any) {
      toast.error('Failed to record payment: ' + err.message);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const statusColors = {
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    partial: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    overdue: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-gray-500 text-sm">Manage project invoices and track payments.</p>
        </div>
        <button 
          onClick={fetchInvoices}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:shadow-md transition-all active:scale-95"
        >
          <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
          Sync
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center sticky top-2 z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number or client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B07D7]/20 focus:border-[#0B07D7] outline-none transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 md:w-44 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0B07D7]/20 text-sm font-bold text-gray-700"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#0B07D7] mx-auto mb-3" />
                    <span className="text-sm font-bold text-gray-400">Fetching Invoices...</span>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const balance = inv.amount - (inv.paid_amount || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[#0B07D7]">{inv.invoice_number}</span>
                          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" /> {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{inv.customers?.name || 'Unknown'}</span>
                          <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-1">
                             <User className="w-3 h-3" /> {inv.customers?.project_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-sm font-black text-gray-900">{formatCurrency(inv.amount)}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={cn("text-sm font-black", balance > 0 ? "text-rose-600" : "text-emerald-600")}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          statusColors[inv.status]
                        )}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {inv.status !== 'paid' && (
                            <button 
                              onClick={() => setRecordingPaymentFor(inv)}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                              title="Record Payment"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDownloadPDF(inv, 'download')}
                            className="p-2 text-gray-400 hover:text-[#0B07D7] hover:bg-blue-50 rounded-xl"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadPDF(inv, 'print')}
                            className="p-2 text-gray-400 hover:text-[#0B07D7] hover:bg-blue-50 rounded-xl"
                            title="Print Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirmId(inv.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredInvoices.map((inv) => {
            const balance = inv.amount - (inv.paid_amount || 0);
            return (
              <div key={inv.id} className="p-5 space-y-4 active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black text-[#0B07D7] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{inv.invoice_number}</span>
                    <h4 className="text-lg font-bold text-gray-900 mt-2">{inv.customers?.name}</h4>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    statusColors[inv.status]
                  )}>
                    {inv.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-800">{formatCurrency(inv.amount)}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Balance</p>
                    <p className={cn("text-sm font-black", balance > 0 ? "text-rose-600" : "text-emerald-600")}>
                      {formatCurrency(balance)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button 
                    onClick={() => handleDownloadPDF(inv, 'download')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0B07D7] text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button 
                    onClick={() => handleDownloadPDF(inv, 'print')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-[#0B07D7] text-xs font-black rounded-2xl active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4" /> PRINT
                  </button>
                  {inv.status !== 'paid' && (
                    <button 
                      onClick={() => setRecordingPaymentFor(inv)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 text-xs font-black rounded-2xl active:scale-95 transition-all"
                    >
                      <CreditCard className="w-4 h-4" /> PAY
                    </button>
                  )}
                  <button 
                    onClick={() => setDeleteConfirmId(inv.id)}
                    className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-95 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordingPaymentFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRecordingPaymentFor(null)} />
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 max-w-sm w-full animate-scale-up z-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
              <button type="button" onClick={() => setRecordingPaymentFor(null)} className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100"><XCircle className="w-5 h-5" /></button>
            </div>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Invoice:</span>
                    <span className="font-bold text-gray-900">{recordingPaymentFor.invoice_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Balance Due:</span>
                    <span className="font-black text-rose-600">{formatCurrency(recordingPaymentFor.amount - (recordingPaymentFor.paid_amount || 0))}</span>
                </div>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Payment Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(e.target.value)} 
                    max={recordingPaymentFor.amount - (recordingPaymentFor.paid_amount || 0)}
                    className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B07D7]/20 outline-none text-base font-bold text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={discountAmount} 
                    onChange={e => setDiscountAmount(e.target.value)} 
                    max={recordingPaymentFor.amount - (recordingPaymentFor.paid_amount || 0)}
                    className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B07D7]/20 outline-none text-base font-bold text-gray-900" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={e => setPaymentMethod(e.target.value)} 
                  className="w-full px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B07D7]/20 outline-none text-sm font-medium"
                >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={paymentNotes} 
                  onChange={e => setPaymentNotes(e.target.value)} 
                  placeholder="Transaction ID, remarks..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0B07D7]/20 outline-none text-sm" 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setRecordingPaymentFor(null)} className="flex-1 py-3 bg-gray-50 text-gray-700 font-bold rounded-2xl border border-gray-200/50 hover:bg-gray-100 active:scale-95 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmittingPayment} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmittingPayment && <Loader2 className="w-4 h-4 animate-spin" />} Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 animate-scale-up z-10">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Delete Invoice?</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                This will permanently delete this invoice and all associated payment records.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3.5 bg-gray-50 text-gray-700 font-bold rounded-2xl border border-gray-200/50 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 active:scale-95 transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal animation helper styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scale-up {
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
