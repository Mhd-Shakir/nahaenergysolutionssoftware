'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';

export default function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [isClosed, setIsClosed] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();
  const DEVELOPER_EMAILS = ['developernaha@gmail.com'];

  useEffect(() => {
    // Initial check
    checkStatus();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    const { data, error } = await supabase
      .from('system_settings')
      .select('is_closed')
      .eq('id', 1)
      .single();

    if (!error && data) {
      setIsClosed(data.is_closed);
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email && DEVELOPER_EMAILS.includes(session.user.email)) {
      setIsDeveloper(true);
    } else {
      setIsDeveloper(false);
    }
  };

  // Do not block the developer page itself, or the login page so they can login to open it.
  const isDeveloperPage = pathname?.startsWith('/developer');
  const isAuthPage = pathname?.startsWith('/login');
  
  if (isClosed && !isDeveloperPage && !isAuthPage && !isDeveloper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-red-50 p-4 rounded-full">
              <ShieldAlert className="w-12 h-12 text-red-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Software Closed</h1>
            <p className="text-gray-500 mt-2">
              Sorry, the software is currently closed due to a pending payment issue. Please contact the developer to resolve this.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
