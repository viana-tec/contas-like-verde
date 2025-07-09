
import React from 'react';
import { Bell, User, Search } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#1a1a1a] border-b border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search - Hidden on mobile, shown on larger screens */}
          <div className="relative hidden sm:block">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#39FF14] transition-colors w-full sm:w-64"
            />
          </div>
          
          {/* Mobile Search Icon */}
          <button className="sm:hidden p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Search size={20} className="text-gray-400" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative p-2 rounded-xl hover:bg-gray-800 transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 bg-[#39FF14] rounded-full flex items-center justify-center">
              <User size={16} className="text-black" />
            </div>
            {/* User info - Hidden on mobile */}
            <div className="text-sm hidden sm:block">
              <p className="font-medium">João Silva</p>
              <p className="text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
