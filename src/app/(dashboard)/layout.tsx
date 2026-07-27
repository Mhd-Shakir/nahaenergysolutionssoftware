import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import MobileNav from '@/components/MobileNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
