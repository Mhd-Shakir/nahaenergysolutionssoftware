'use client';

import { Bell, Search, User } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="md:hidden">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        </div>
        <div className="relative w-full max-w-[240px] md:w-96 hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0047FF] focus:border-[#0047FF] text-xs md:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="h-8 w-px bg-gray-200 mx-1 md:mx-2" />
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-gray-900 leading-tight">Admin User</p>
            <p className="text-[10px] text-gray-500 font-medium">Naha Energy</p>
          </div>
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shadow-sm">
            <User className="w-5 h-5 md:w-6 md:h-6 text-[#0047FF]" />
          </div>
        </div>
      </div>
    </header>
  );
}
