
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  DollarSign, 
  Users, 
  UserCheck, 
  Settings,
  User,
  BarChart3
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Contas a Pagar', path: '/contas', icon: CreditCard },
    { name: 'Boletos', path: '/boletos', icon: FileText },
    { name: 'Pagamentos', path: '/pagamentos', icon: DollarSign },
    { name: 'Folha Salarial', path: '/folha-salarial', icon: Users },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart3 },
    { name: 'Usuários', path: '/usuarios', icon: UserCheck },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ];

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#39FF14] rounded-lg flex items-center justify-center">
            <DollarSign size={20} className="text-black" />
          </div>
          <span className="text-lg sm:text-xl font-bold text-white">FinanceApp</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="space-y-1 sm:space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${
                  isActive
                    ? 'bg-[#39FF14] text-black font-medium'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={18} className="sm:w-5 sm:h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 sm:p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#39FF14] rounded-full flex items-center justify-center">
            <User size={16} className="sm:w-5 sm:h-5 text-black" />
          </div>
          <div>
            <p className="font-medium text-white text-sm sm:text-base">João Silva</p>
            <p className="text-xs sm:text-sm text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
};
