'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FilePlus, 
  Users, 
  Calculator, 
  BarChart3,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Home', href: '/', icon: LayoutDashboard },
  { label: 'Propose', href: '/proposals/new', icon: FilePlus },
  { label: 'Clients', href: '/customers', icon: Users },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Subsidy', href: '/subsidy', icon: Calculator },
  { label: 'Stats', href: '/analytics', icon: BarChart3 },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around md:hidden z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px]",
              isActive 
                ? "text-[#0047FF]" 
                : "text-gray-400"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-all",
              isActive ? "bg-blue-50" : ""
            )}>
              <item.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
