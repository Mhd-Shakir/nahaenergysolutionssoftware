'use client';

import { useState, useEffect, useMemo } from 'react';
import MetricCard from '@/components/MetricCard';
import RevenueChart from '@/components/charts/RevenueChart';
import DistrictChart from '@/components/charts/DistrictChart';
import SalesChart from '@/components/charts/SalesChart';
import { formatCurrency } from '@/lib/subsidyCalc';
import { createClient } from '@/lib/supabase/client';
import { 
  TrendingUp, 
  BarChart3, 
  Zap, 
  Users,
  PieChart as PieIcon,
  Calendar,
  Clock,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = 'day' | 'week' | 'month' | 'year';

interface SaleEntry {
  amount: number;
  sale_date: string;
  district: string;
  customer_id?: string;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SaleEntry[]>([]);
  const [customersData, setCustomersData] = useState<any[]>([]);

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: sales } = await supabase.from('sales').select('*');
      const { data: customers } = await supabase.from('customers').select('*');
      
      setSalesData(sales || []);
      setCustomersData(customers || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredStats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'day') startDate.setHours(0, 0, 0, 0);
    else if (period === 'week') startDate.setDate(now.getDate() - 7);
    else if (period === 'month') startDate.setMonth(now.getMonth() - 1);
    else if (period === 'year') startDate.setFullYear(now.getFullYear() - 1);

    const filteredSales = salesData.filter(s => new Date(s.sale_date) >= startDate);
    const totalSales = filteredSales.reduce((acc, s) => acc + s.amount, 0);
    const avgDealSize = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
    
    const completedCustomers = customersData.filter(c => 
      c.status === 'completed' && new Date(c.created_at) >= startDate
    );
    const totalKw = completedCustomers.reduce((acc, c) => acc + (c.system_kw || 0), 0);
    
    const totalLeads = customersData.filter(c => new Date(c.created_at) >= startDate).length;
    const convRate = totalLeads > 0 ? (completedCustomers.length / totalLeads) * 100 : 0;

    return { totalSales, avgDealSize, convRate, totalKw, filteredSales };
  }, [salesData, customersData, period]);

  const revenueChartData = useMemo(() => {
    const { filteredSales } = filteredStats;
    
    if (period === 'day') {
      const hours = ['6AM', '10AM', '2PM', '6PM', '10PM'];
      return hours.map(h => ({
        month: h,
        revenue: filteredSales.length > 0 ? filteredSales[0].amount / hours.length : 0 // Simplified for day
      }));
    }

    if (period === 'week') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((d, i) => {
        const daySales = filteredSales.filter(s => new Date(s.sale_date).getDay() === (i + 1) % 7);
        return {
          month: d,
          revenue: daySales.reduce((acc, s) => acc + s.amount, 0)
        };
      });
    }

    // Default: Month/Year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const displayMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

    return displayMonths.map((m, i) => {
      const monthIndex = months.indexOf(m);
      const mSales = filteredSales.filter(s => new Date(s.sale_date).getMonth() === monthIndex);
      return {
        month: m,
        revenue: mSales.reduce((acc, s) => acc + s.amount, 0)
      };
    });
  }, [filteredStats, period]);

  const districtData = useMemo(() => {
    const districts: Record<string, number> = {};
    filteredStats.filteredSales.forEach(s => {
      districts[s.district] = (districts[s.district] || 0) + 1;
    });
    return Object.entries(districts)
      .map(([district, sales]) => ({ district, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredStats]);

  const sizeData = useMemo(() => {
    const sizes = [
      { name: '1-3 KW', min: 0, max: 3, value: 0 },
      { name: '4-6 KW', min: 4, max: 6, value: 0 },
      { name: '8-10 KW', min: 8, max: 10, value: 0 },
      { name: 'Above 10 KW', min: 11, max: 1000, value: 0 },
    ];
    
    customersData.forEach(c => {
      const kw = c.system_kw || 0;
      const range = sizes.find(s => kw >= s.min && kw <= s.max);
      if (range) range.value++;
    });
    
    return sizes.map(({ name, value }) => ({ name, value }));
  }, [customersData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0047FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Advanced Analytics</h1>
          <p className="text-gray-500 text-sm">Real-time performance tracking based on proposal submissions.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 text-xs font-black rounded-lg transition-all",
                period === p 
                  ? "bg-[#0047FF] text-white shadow-md shadow-blue-100" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label={period === 'day' ? "Today's Revenue" : period === 'week' ? "Weekly Revenue" : "Revenue Growth"}
          value={formatCurrency(filteredStats.totalSales)} 
          color="amber"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricCard 
          label="Average Deal Size" 
          value={formatCurrency(filteredStats.avgDealSize)} 
          icon={<BarChart3 className="w-6 h-6" />}
        />
        <MetricCard 
          label="Conversion Rate" 
          value={`${filteredStats.convRate.toFixed(1)}%`} 
          color="green"
          icon={<Users className="w-6 h-6" />}
        />
        <MetricCard 
          label="KW Commissioned" 
          value={`${filteredStats.totalKw.toFixed(1)} KW`} 
          color="blue"
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0047FF]" /> 
              {period === 'day' ? 'Hourly Performance' : period === 'week' ? 'Daily Growth' : 'Revenue Trends'}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" /> Live
            </div>
          </div>
          <RevenueChart data={revenueChartData} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0047FF]" /> Sales by District
            </h3>
          </div>
          <DistrictChart data={districtData.length > 0 ? districtData : [{ district: 'No Data', sales: 0 }]} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#0047FF]" /> Distribution by Size
            </h3>
          </div>
          <SalesChart data={sizeData} />
        </div>

        <div className="bg-[#000B26] rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 className="w-32 h-32" />
          </div>
          
          <div>
            <h3 className="text-2xl font-black mb-2 tracking-tight uppercase">System Health</h3>
            <p className="text-blue-200/60 text-sm leading-relaxed max-w-sm">
              Your proposal-to-sale pipeline is active. Current period reflects <span className="text-white font-bold">{filteredStats.filteredSales.length}</span> recorded sales across <span className="text-white font-bold">{districtData.length}</span> districts.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Live Feed</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-white">Active</p>
                <div className="w-2 h-2 rounded-full bg-green-400 mb-2 animate-pulse" />
              </div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Data Source</p>
              <div className="flex items-end gap-2">
                <p className="text-xl font-black text-white">Cloud DB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
