'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert, Power } from 'lucide-react';

const DEVELOPER_EMAILS = ['developernaha@gmail.com'];

export default function DeveloperPage() {
  const [isClosed, setIsClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAuthAndStatus();
  }, []);

  const checkAuthAndStatus = async () => {
    setLoading(true);
    
    // Check Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    // Ensure it's the developer
    if (!session.user.email || !DEVELOPER_EMAILS.includes(session.user.email)) {
      router.push('/');
      return;
    }
    
    setAuthorized(true);

    // Fetch current status
    const { data, error } = await supabase
      .from('system_settings')
      .select('is_closed')
      .eq('id', 1)
      .single();

    if (!error && data) {
      setIsClosed(data.is_closed);
    }
    
    setLoading(false);
  };

  const toggleSoftware = async () => {
    setToggling(true);
    const newState = !isClosed;
    
    const { data, error } = await supabase
      .from('system_settings')
      .update({ is_closed: newState })
      .eq('id', 1)
      .select();

    if (error) {
      alert('Error updating status: ' + error.message);
    } else if (data && data.length > 0) {
      setIsClosed(newState);
    } else {
      alert('The setting could not be updated. This is usually because Row Level Security (RLS) is blocking the update. Please go to your Supabase dashboard, click "Authentication" -> "Policies", and disable RLS for the system_settings table, or add an update policy.');
    }
    
    setToggling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-red-50 p-4 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Developer Area</h1>
          <p className="text-gray-500 mt-2">
            Use this toggle to instantly close or open the software for all clients.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-gray-700">Current Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold ${isClosed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {isClosed ? 'CLOSED (Maintenance)' : 'OPEN (Active)'}
            </span>
          </div>

          <button
            onClick={toggleSoftware}
            disabled={toggling}
            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center space-x-2 transition-all ${
              isClosed 
                ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200' 
                : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
            } disabled:opacity-50`}
          >
            {toggling ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Power className="w-6 h-6" />
                <span>{isClosed ? 'OPEN SOFTWARE' : 'CLOSE SOFTWARE'}</span>
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">
          Note: If closed, active users will be locked out within 10 seconds.
        </p>
      </div>
    </div>
  );
}
