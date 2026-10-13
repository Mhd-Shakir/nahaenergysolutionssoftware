'use client';

import { Bell, Search, User } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 md:px-10 flex items-center justify-between sticky top-0 z-40 transition-all">
      <div className="flex items-center gap-6 flex-1">
        <div className="md:hidden">
          <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
        </div>
        <div className="relative w-full max-w-md hidden sm:block">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search proposals, customers..."
            className="block w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0047FF]/20 focus:border-[#0047FF] text-sm text-gray-700 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <button className="relative p-2.5 text-gray-500 hover:text-[#0047FF] rounded-full hover:bg-blue-50 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-10 w-px bg-gray-200 mx-2" />
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-[#0047FF] transition-colors">Admin User</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Naha Energy</p>
          </div>
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200 shadow-sm group-hover:shadow-md transition-all">
            <User className="w-5 h-5 md:w-6 md:h-6 text-[#0047FF]" />
          </div>
        </div>
      </div>
    </header>
  );
}
