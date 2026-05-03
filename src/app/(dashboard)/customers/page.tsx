'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Customer, ProjectStatus } from '@/types';
import { formatCurrency } from '@/lib/subsidyCalc';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Trash2,
  Loader2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: ProjectStatus[] = ['quoted', 'pending', 'completed', 'cancelled'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();

    // Set up realtime subscription
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          fetchCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false });

    const { data } = await query;
    if (data) setCustomers(data);
    setLoading(false);
  }

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.project_id.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, status: ProjectStatus) => {
    const { error } = await supabase
      .from('customers')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    }
  };

  const statusColors = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-blue-100 text-blue-700 border-blue-200",
    quoted: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-500 text-sm">View and manage all solar installation projects.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, PID, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0047FF] focus:border-[#0047FF] text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0047FF] text-sm"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table View (Desktop/Tablet) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4 font-black">Project ID</th>
                <th className="px-6 py-4 font-black">Customer</th>
                <th className="px-6 py-4 font-black">System</th>
                <th className="px-6 py-4 font-black">Net Amount</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0047FF] mx-auto" />
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#0047FF]">{customer.project_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{customer.name}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {customer.address}, {customer.district}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{customer.system_kw} KW</span>
                        <span className="text-[10px] text-gray-400 uppercase font-bold">{customer.panel_brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-gray-900">{formatCurrency(customer.net_cost)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={customer.status}
                        onChange={(e) => handleUpdateStatus(customer.id, e.target.value as ProjectStatus)}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border outline-none transition-all cursor-pointer",
                          statusColors[customer.status as keyof typeof statusColors]
                        )}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="View Details" className="p-2 text-gray-400 hover:text-[#0047FF] hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button title="Edit" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                      <p className="font-medium text-gray-400">No customers found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card View (Mobile) */}
        <div className="grid grid-cols-1 divide-y divide-gray-100 md:hidden">
          {loading && filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0047FF] mx-auto" />
            </div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-5 space-y-4 active:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#0047FF] uppercase tracking-widest">{customer.project_id}</span>
                    <h4 className="text-base font-bold text-gray-900 mt-1">{customer.name}</h4>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    statusColors[customer.status as keyof typeof statusColors]
                  )}>
                    {customer.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">System Size</span>
                    <span className="text-sm font-bold text-gray-700">{customer.system_kw} KW</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Net Amount</span>
                    <span className="text-sm font-black text-gray-900">{formatCurrency(customer.net_cost)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{customer.address}, {customer.district}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex gap-2">
                    <button className="p-2 text-gray-400 border border-gray-200 rounded-lg hover:text-[#0047FF] hover:bg-blue-50 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 border border-gray-200 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                   </div>
                   <select
                    value={customer.status}
                    onChange={(e) => handleUpdateStatus(customer.id, e.target.value as ProjectStatus)}
                    className="text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#0047FF]"
                   >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                   </select>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-400">No customers found.</p>
            </div>
          )}
        </div>
      </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {filteredCustomers.length} customers</p>
          <div className="flex gap-2">
            <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled className="p-2 border border-gray-200 rounded-lg disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
  );
}
