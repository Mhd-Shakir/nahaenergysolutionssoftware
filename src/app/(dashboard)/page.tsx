import { createClient } from '@/lib/supabase/server';
import MetricCard from '@/components/MetricCard';
import RevenueChart from '@/components/charts/RevenueChart';
import SalesChart from '@/components/charts/SalesChart';
import { formatCurrency } from '@/lib/subsidyCalc';
import { 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  HandCoins,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch real data from Supabase
  const { data: sales } = await supabase.from('sales').select('amount, sale_date');
  const { count: proposalsCount } = await supabase.from('proposals').select('*', { count: 'exact', head: true });
  const { data: customers } = await supabase.from('customers').select('*');
  
  const completedCount = customers?.filter(c => c.status === 'completed').length || 0;
  const totalRevenue = sales?.reduce((acc, sale) => acc + sale.amount, 0) || 0;
  const totalSubsidy = customers?.reduce((acc, cust) => acc + (cust.subsidy || 0), 0) || 0;

  // Process Revenue Chart Data (Real)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = months.map((month, index) => {
    const monthlySales = sales?.filter(s => new Date(s.sale_date).getMonth() === index) || [];
    return {
      month,
      revenue: monthlySales.reduce((acc, s) => acc + s.amount, 0)
    };
  }).filter(m => m.revenue > 0 || months.indexOf(m.month) <= new Date().getMonth());

  // Process Sales by Size (Real)
  const sizes = [
    { name: '1 KW', min: 0, max: 1.5, value: 0 },
    { name: '3 KW', min: 2.5, max: 3.5, value: 0 },
    { name: '5 KW', min: 4.5, max: 5.5, value: 0 },
    { name: '10 KW', min: 9, max: 11, value: 0 },
    { name: 'Others', min: 0, max: 0, value: 0 } // Fallback
  ];

  customers?.forEach(c => {
    const kw = c.system_kw || 0;
    const range = sizes.find(s => kw >= s.min && kw <= s.max);
    if (range) range.value++;
    else sizes[4].value++;
  });

  const salesBySizeData = sizes.filter(s => s.value > 0);

  // Recent Proposals
  const { data: recentProposals } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm font-medium">Real-time solar business performance and installation tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          sub="Recorded from proposals"
          color="amber"
          icon={<IndianRupee className="w-6 h-6" />}
        />
        <MetricCard 
          label="Active Proposals" 
          value={(proposalsCount || 0).toString()} 
          sub="In pipeline"
          color="blue"
          icon={<FileText className="w-6 h-6" />}
        />
        <MetricCard 
          label="Installations" 
          value={completedCount.toString()} 
          sub="Successfully commissioned"
          color="green"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <MetricCard 
          label="Subsidy Payouts" 
          value={formatCurrency(totalSubsidy)} 
          sub="Projected total"
          icon={<HandCoins className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0047FF]" />
              Revenue Trends (Live)
            </h3>
            <div className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-widest">
              Updated
            </div>
          </div>
          <RevenueChart data={revenueByMonth.slice(-6)} />
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Distribution by Size</h3>
          {salesBySizeData.length > 0 ? (
            <SalesChart data={salesBySizeData} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm font-medium italic">
              No data recorded yet
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Customer Activity</h3>
          <Link href="/customers" className="text-[#0047FF] text-sm font-bold flex items-center gap-1 hover:underline">
            Manage All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Project ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">System</th>
                <th className="px-6 py-4">Net Value</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentProposals && recentProposals.length > 0 ? (
                recentProposals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-[#0047FF] bg-blue-50 px-2 py-1 rounded-md">{item.project_id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{item.district}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">{item.system_kw} KW</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase">{item.panel_brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-gray-900">{formatCurrency(item.net_cost)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        item.status === 'completed' ? "bg-green-100 text-green-700 border-green-200" :
                        item.status === 'pending' ? "bg-amber-100 text-amber-700 border-amber-200" :
                        item.status === 'quoted' ? "bg-blue-100 text-blue-700 border-blue-200" :
                        "bg-gray-100 text-gray-700 border-gray-200"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                    No recent activity to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
