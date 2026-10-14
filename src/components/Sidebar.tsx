'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FilePlus, 
  Users, 
  Calculator, 
  BarChart3, 
  LogOut,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'New Proposal', href: '/proposals/new', icon: FilePlus },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Subsidy Calculator', href: '/subsidy', icon: Calculator },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex w-72 bg-white/60 backdrop-blur-md border-r border-gray-100 h-screen sticky top-0 flex-col shadow-sm">
      <div className="p-8 pb-4 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Naha Energy" className="h-14 w-auto object-contain transition-transform hover:scale-105" />
        </Link>
      </div>

      <div className="px-6 mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 mt-4">Main Menu</h3>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-[#0047FF] text-white shadow-md shadow-blue-200 font-semibold" 
                  : "text-gray-500 hover:bg-blue-50 hover:text-[#0047FF]"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "")} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-4 border-t border-gray-100 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
