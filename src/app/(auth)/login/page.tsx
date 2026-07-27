'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [showSorry, setShowSorry] = useState(false);
>>>>>>> 152dc16220950f7a5aa935233d1879bfc97197ce
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD
=======
    setShowSorry(true);

    /* Temporary disabled login logic
>>>>>>> 152dc16220950f7a5aa935233d1879bfc97197ce
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
<<<<<<< HEAD
=======
    */
>>>>>>> 152dc16220950f7a5aa935233d1879bfc97197ce
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-gray-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Naha Energy" className="h-20 w-auto object-contain" />
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium tracking-wide">
            SOLAR BUSINESS MANAGEMENT
          </p>
        </div>

<<<<<<< HEAD
=======
        {showSorry ? (
          <div className="mt-8 flex flex-col items-center justify-center p-8 bg-white rounded-xl">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">Sorry!</h2>
            <p className="text-center text-gray-600">
              The system is temporarily unavailable. Please try again later.
            </p>
            <button
              onClick={() => setShowSorry(false)}
              className="mt-6 px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
>>>>>>> 152dc16220950f7a5aa935233d1879bfc97197ce
  <form className="mt-8 space-y-6" onSubmit={handleLogin}>
    {error && (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
        {error}
      </div>
    )}
    <div className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#0047FF] focus:border-[#0047FF] sm:text-sm"
          placeholder="admin@nahaenergy.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
