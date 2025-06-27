
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, User, Eye } from 'lucide-react';

const mockUsers = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@empresa.com',
    cargo: 'Gerente Financeiro',
    permissao: 'Admin',
    status: 'Ativo',
    ultimoAcesso: '2024-12-27 09:30'
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@empresa.com',
    cargo: 'Analista Financeiro',
    permissao: 'Financeiro',
    status: 'Ativo',
    ultimoAcesso: '2024-12-27 08:15'
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro@empresa.com',
    cargo: 'Assistente',
    permissao: 'Leitor',
    status: 'Inativo',
    ultimoAcesso: '2024-12-25 14:20'
  }
];

export const UserManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'Admin':
        return <Shield size={16} className="text-red-400" />;
      case 'Financeiro':
        return <User size={16} className="text-[#39FF14]" />;
      case 'Leitor':
        return <Eye size={16} className="text-blue-400" />;
      default:
        return <User size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Usuários</h1>
          <p className="text-gray-400">Gerencie usuários e permissões</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#32e012] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {/* Permission Legend */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Níveis de Permissão</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-red-900/20 rounded-xl">
            <Shield size={20} className="text-red-400" />
            <div>
              <p className="font-medium text-red-400">Admin</p>
              <p className="text-sm text-gray-400">Acesso total ao sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-900/20 rounded-xl">
            <User size={20} className="text-[#39FF14]" />
            <div>
              <p className="font-medium text-[#39FF14]">Financeiro</p>
              <p className="text-sm text-gray-400">Apenas seção financeira</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-900/20 rounded-xl">
            <Eye size={20} className="text-blue-400" />
            <div>
              <p className="font-medium text-blue-400">Leitor</p>
              <p className="text-sm text-gray-400">Apenas visualização</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Usuário</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Cargo</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Permissão</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Último Acesso</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#39FF14] rounded-full flex items-center justify-center">
                        <User size={20} className="text-black" />
                      </div>
                      <div>
                        <p className="font-medium">{user.nome}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">{user.cargo}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getPermissionIcon(user.permissao)}
                      <span className={`font-medium ${
                        user.permissao === 'Admin' ? 'text-red-400' :
                        user.permissao === 'Financeiro' ? 'text-[#39FF14]' :
                        'text-blue-400'
                      }`}>
                        {user.permissao}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Ativo' ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">{user.ultimoAcesso}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for new user */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Novo Usuário</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="text"
                placeholder="Cargo"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors">
                <option value="">Selecione a permissão</option>
                <option value="Admin">Admin</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Leitor">Leitor</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-[#39FF14] text-black px-4 py-3 rounded-xl font-medium hover:bg-[#32e012] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
