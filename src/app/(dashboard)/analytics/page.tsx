'use client';

import { useState, useEffect } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Period = 'day' | 'week' | 'month' | 'year';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 4500000,
    avgDealSize: 350000,
    convRate: 24.5,
    totalKw: 145
  });

  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, [period]);

  async function fetchStats() {
    setLoading(true);
    // In a real app, we would add filters based on the period (day, week, month, year)
    // For now we simulate the loading and use period-based multipliers for mock visual changes
    
    // Fetch real base data
    const { data: sales } = await supabase.from('sales').select('amount');
    const { data: customers } = await supabase.from('customers').select('status, system_kw');

    const baseSales = sales?.reduce((acc, s) => acc + s.amount, 0) || 0;
    const baseKw = customers?.filter(c => c.status === 'completed').reduce((acc, c) => acc + (c.system_kw || 0), 0) || 0;
    
    // Mock multiplier based on period to show some change
    const multiplier = period === 'day' ? 0.05 : period === 'week' ? 0.25 : period === 'month' ? 1 : 12;

    setStats({
      totalSales: (baseSales || 4500000) * multiplier,
      avgDealSize: 350000, // Stays same for demo
      convRate: 24.5 + (period === 'year' ? 5 : 0),
      totalKw: (baseKw || 145) * multiplier
    });

    setLoading(false);
  }

  // Mock chart data variations
  const getMonthlyData = () => {
    if (period === 'year') return [
      { month: 'Q1', revenue: 4200000 },
      { month: 'Q2', revenue: 5500000 },
      { month: 'Q3', revenue: 4800000 },
      { month: 'Q4', revenue: 6500000 },
    ];
    if (period === 'week') return [
      { month: 'Mon', revenue: 120000 },
      { month: 'Tue', revenue: 150000 },
      { month: 'Wed', revenue: 180000 },
      { month: 'Thu', revenue: 220000 },
      { month: 'Fri', revenue: 190000 },
      { month: 'Sat', revenue: 250000 },
      { month: 'Sun', revenue: 100000 },
    ];
    if (period === 'day') return [
      { month: '6AM', revenue: 20000 },
      { month: '10AM', revenue: 45000 },
      { month: '2PM', revenue: 80000 },
      { month: '6PM', revenue: 35000 },
      { month: '10PM', revenue: 15000 },
    ];
    return [
      { month: 'Jan', revenue: 1200000 },
      { month: 'Feb', revenue: 1500000 },
      { month: 'Mar', revenue: 1800000 },
      { month: 'Apr', revenue: 2200000 },
      { month: 'May', revenue: 1900000 },
      { month: 'Jun', revenue: 2500000 },
    ];
  };

  const districtData = [
    { district: 'Malappuram', sales: 45 },
    { district: 'Calicut', sales: 32 },
    { district: 'Palakkad', sales: 28 },
    { district: 'Thrissur', sales: 22 },
    { district: 'Ernakulam', sales: 18 },
  ];

  const sizeData = [
    { name: '1-3 KW', value: 40 },
    { name: '4-6 KW', value: 30 },
    { name: '8-10 KW', value: 20 },
    { name: 'Above 10 KW', value: 10 },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="text-gray-500 text-sm">Deep dive into sales performance and installation metrics.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                period === p 
                  ? "bg-[#0047FF] text-white shadow-md shadow-blue-100" 
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label={period === 'day' ? "Today's Sales" : period === 'week' ? "Weekly Sales" : "Total Sales (FY)"}
          value={formatCurrency(stats.totalSales)} 
          color="amber"
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <MetricCard 
          label="Average Deal Size" 
          value={formatCurrency(stats.avgDealSize)} 
          icon={<BarChart3 className="w-6 h-6" />}
        />
        <MetricCard 
          label="Conversion Rate" 
          value={`${stats.convRate.toFixed(1)}%`} 
          color="green"
          icon={<Users className="w-6 h-6" />}
        />
        <MetricCard 
          label="KW Installed" 
          value={`${stats.totalKw.toFixed(0)} KW`} 
          color="blue"
          icon={<Zap className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#0047FF]" /> 
              {period === 'day' ? 'Hourly Performance' : period === 'week' ? 'Daily Growth' : 'Revenue Growth'}
            </h3>
            <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </div>
          </div>
          <RevenueChart data={getMonthlyData()} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0047FF]" /> Revenue by District
            </h3>
          </div>
          <DistrictChart data={districtData} />
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#0047FF]" /> Sales by System Size
            </h3>
          </div>
          <SalesChart data={sizeData} />
        </div>

        <div className="bg-[#000B26] rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BarChart3 className="w-32 h-32" />
          </div>
          
          <div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">Performance Summary</h3>
            <p className="text-blue-200/60 text-sm leading-relaxed max-w-sm">
              Your installation capacity has increased by <span className="text-white font-bold">24%</span> compared to the previous period. The Malappuram district remains the top performer with a 35% market share.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Target Achievement</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-white">84%</p>
                <p className="text-[10px] text-green-400 font-bold mb-1">+5.2%</p>
              </div>
            </div>
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest mb-1">Market Reach</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-white">18.5%</p>
                <p className="text-[10px] text-blue-400 font-bold mb-1">Global</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MapPin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
