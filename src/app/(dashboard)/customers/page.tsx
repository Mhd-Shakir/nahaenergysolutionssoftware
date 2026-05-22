'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/Toast';
import { Customer, ProjectStatus } from '@/types';
import { formatCurrency } from '@/lib/subsidyCalc';
import { generateProposalPDF } from '@/lib/pdfGenerator';
import { 
  Search, 
  Filter, 
  Eye, 
  Trash2,
  Loader2,
  AlertCircle,
  MapPin,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: ProjectStatus[] = ['quoted', 'pending', 'completed', 'cancelled'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const toast = useToast();
  
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchCustomers();

    const channel = supabase
      .channel('customers-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCustomers(prev => [payload.new as Customer, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCustomers(prev => prev.map(c => c.id === payload.new.id ? payload.new as Customer : c));
          } else if (payload.eventType === 'DELETE') {
            setCustomers(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database');
    } finally {
      setLoading(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const searchStr = search.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(searchStr) || 
        c.project_id.toLowerCase().includes(searchStr) ||
        (c.address && c.address.toLowerCase().includes(searchStr)) ||
        (c.district && c.district.toLowerCase().includes(searchStr));
      
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const handleUpdateStatus = async (id: string, status: ProjectStatus) => {
    const originalCustomers = [...customers];
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c));

    try {
      const { error } = await supabase
        .from('customers')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('Project status updated!');
    } catch (err: any) {
      setCustomers(originalCustomers);
      toast.error('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    const originalCustomers = [...customers];
    setCustomers(prev => prev.filter(c => c.id !== id));

    try {
      // 1. Delete associated sales records
      const { error: salesError } = await supabase
        .from('sales')
        .delete()
        .eq('customer_id', id);

      if (salesError) throw salesError;

      // 2. Delete associated proposals records
      const { error: proposalsError } = await supabase
        .from('proposals')
        .delete()
        .eq('customer_id', id);

      if (proposalsError) throw proposalsError;

      // 3. Delete the customer
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Project successfully deleted!');
    } catch (err: any) {
      setCustomers(originalCustomers);
      toast.error('Delete failed: ' + err.message);
    }
  };

  const handleDownloadPDF = async (customer: Customer) => {
    try {
      // Create a mock proposal object from customer data
      const proposal = {
        daily_output_min: Math.floor(customer.system_kw * 3.8),
        daily_output_max: Math.ceil(customer.system_kw * 4.2),
      };
      await generateProposalPDF(customer, proposal);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      toast.error('Error generating PDF');
    }
  };

  const statusColors = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    quoted: "bg-blue-100 text-[#0B07D7] border-blue-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-gray-500 text-sm">Real-time solar project tracking and management.</p>
        </div>
        <button 
          onClick={fetchCustomers}
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
            placeholder="Search by name, ID, or district..."
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
            <option value="all">All Projects</option>
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">System Details</th>
                <th className="px-6 py-4 text-right">Investment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#0B07D7] mx-auto mb-3" />
                    <span className="text-sm font-bold text-gray-400">Fetching Project Data...</span>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-[#0B07D7] bg-blue-50 px-2 py-1 rounded-md">{c.project_id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{c.name}</span>
                        <span className="text-[11px] text-gray-500 font-medium">{c.district}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">{c.system_kw} KW</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase">{c.panel_brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className="text-sm font-black text-gray-900">{formatCurrency(c.net_cost)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value as ProjectStatus)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 outline-none transition-all cursor-pointer shadow-sm",
                          statusColors[c.status]
                        )}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleDownloadPDF(c)}
                          className="p-2 text-gray-400 hover:text-[#0B07D7] hover:bg-blue-50 rounded-xl"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(c.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredCustomers.map((c) => (
            <div key={c.id} className="p-5 space-y-4 active:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-[#0B07D7] bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{c.project_id}</span>
                  <h4 className="text-lg font-bold text-gray-900 mt-2">{c.name}</h4>
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {c.district}
                  </p>
                </div>
                <select
                  value={c.status}
                  onChange={(e) => handleUpdateStatus(c.id, e.target.value as ProjectStatus)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border-2 outline-none transition-all shadow-sm",
                    statusColors[c.status]
                  )}
                >
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Capacity</p>
                  <p className="text-sm font-bold text-gray-800">{c.system_kw} KW</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Net Investment</p>
                  <p className="text-sm font-black text-gray-900">{formatCurrency(c.net_cost)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button 
                  onClick={() => handleDownloadPDF(c)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0B07D7] text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" /> DOWNLOAD PROPOSAL
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(c.id)}
                  className="p-3 bg-rose-50 text-rose-600 rounded-2xl active:scale-95 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Confirmation Modal Overlay */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 md:p-8 max-w-sm w-full text-center space-y-6 animate-scale-up z-10">
            <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
              <Trash2 className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Are you sure?</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                This action is permanent and cannot be undone. All associated sales and proposals for this project will be deleted.
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
