import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'green' | 'amber' | 'blue' | 'default';
  icon?: React.ReactNode;
}

export default function MetricCard({ label, value, sub, color = 'default', icon }: MetricCardProps) {
  const colorClasses = {
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-blue-50 text-[#0047FF] border-blue-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    default: "bg-white text-gray-900 border-gray-200",
  };

  const badgeColors = {
    green: "bg-green-500",
    amber: "bg-[#0047FF]",
    blue: "bg-blue-500",
    default: "bg-gray-400",
  };

  return (
    <div className={cn("p-6 rounded-xl border shadow-sm flex items-start justify-between transition-all hover:shadow-md", colorClasses[color])}>
      <div>
        <p className="text-sm font-medium opacity-80">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {sub && <p className="text-xs mt-1 font-medium">{sub}</p>}
      </div>
      {icon && (
        <div className={cn("p-3 rounded-lg bg-opacity-10", color === 'default' ? 'bg-gray-100' : 'bg-white')}>
          {icon}
        </div>
      )}
    </div>
  );
}
