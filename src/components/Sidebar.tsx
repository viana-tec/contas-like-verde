
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Users, 
  Settings,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: BarChart3, path: '/' },
  { name: 'Contas a Pagar', icon: FileText, path: '/contas' },
  { name: 'Boletos', icon: Receipt, path: '/boletos' },
  { name: 'Pagamentos', icon: CreditCard, path: '/pagamentos' },
  { name: 'Relatórios', icon: PieChart, path: '/relatorios' },
  { name: 'Folha Salarial', icon: UserCheck, path: '/folha-salarial' },
  { name: 'Usuários', icon: Users, path: '/usuarios' },
  { name: 'Configurações', icon: Settings, path: '/configuracoes' },
];

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-[#39FF14]">Like Finance</h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[#39FF14] text-black font-medium'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`
                }
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
