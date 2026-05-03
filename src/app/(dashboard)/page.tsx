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

  // Fetch KPI data
  const { data: sales } = await supabase.from('sales').select('amount');
  const { count: proposalsCount } = await supabase.from('proposals').select('*', { count: 'exact', head: true });
  const { count: completedCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'completed');
  const { data: customersSubsidy } = await supabase.from('customers').select('subsidy');

  const totalRevenue = sales?.reduce((acc, sale) => acc + sale.amount, 0) || 0;
  const totalSubsidy = customersSubsidy?.reduce((acc, cust) => acc + (cust.subsidy || 0), 0) || 0;

  // Recent Proposals
  const { data: recentProposals } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Mock data for charts if DB is empty
  const revenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Apr', revenue: 610000 },
    { month: 'May', revenue: 550000 },
    { month: 'Jun', revenue: 670000 },
  ];

  const salesBySizeData = [
    { name: '3 KW', value: 12 },
    { name: '5 KW', value: 8 },
    { name: '10 KW', value: 5 },
    { name: '1 KW', value: 4 },
    { name: 'Others', value: 3 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening with Naha Energy.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Revenue" 
          value={formatCurrency(totalRevenue)} 
          sub="+12% from last month"
          color="amber"
          icon={<IndianRupee className="w-6 h-6" />}
        />
        <MetricCard 
          label="Total Proposals" 
          value={(proposalsCount || 0).toString()} 
          sub="Across all districts"
          color="blue"
          icon={<FileText className="w-6 h-6" />}
        />
        <MetricCard 
          label="Installations Done" 
          value={(completedCount || 0).toString()} 
          sub="Successfully commissioned"
          color="green"
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
        <MetricCard 
          label="Subsidy Claimed" 
          value={formatCurrency(totalSubsidy)} 
          sub="PM Surya Ghar Yojana"
          icon={<HandCoins className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Revenue Trends</h3>
            <div className="flex items-center gap-2 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-md">
              <TrendingUp className="w-3 h-3" />
              <span>GROWING</span>
            </div>
          </div>
          <RevenueChart data={revenueData} />
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-6">Sales by System Size</h3>
          <SalesChart data={salesBySizeData} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Recent Proposals</h3>
          <Link href="/customers" className="text-[#0047FF] text-sm font-bold flex items-center gap-1 hover:underline">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Project ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Capacity</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentProposals && recentProposals.length > 0 ? (
                recentProposals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.project_id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.district}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.system_kw} KW</td>
                    <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(item.net_cost)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                        item.status === 'completed' ? "bg-green-100 text-green-700" :
                        item.status === 'pending' ? "bg-blue-100 text-blue-700" :
                        item.status === 'quoted' ? "bg-indigo-100 text-indigo-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No recent proposals found.
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
