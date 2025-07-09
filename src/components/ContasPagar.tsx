
import React, { useState } from 'react';
import { Plus, Filter, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react';

const mockContas = [
  {
    id: 1,
    nome: 'Energia Elétrica - Dezembro',
    fornecedor: 'CEMIG',
    valor: 'R$ 1.250,00',
    vencimento: '20/12/2024',
    categoria: 'Utilidades',
    status: 'A Vencer',
    boleto: true
  },
  {
    id: 2,
    nome: 'Aluguel do Escritório',
    fornecedor: 'Imobiliária Santos',
    valor: 'R$ 3.500,00',
    vencimento: '15/12/2024',
    categoria: 'Imóveis',
    status: 'Vencida',
    boleto: true
  },
  {
    id: 3,
    nome: 'Material de Escritório',
    fornecedor: 'Papelaria Central',
    valor: 'R$ 450,00',
    vencimento: '25/12/2024',
    categoria: 'Suprimentos',
    status: 'A Vencer',
    boleto: false
  }
];

export const ContasPagar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contas a Pagar</h1>
          <p className="text-gray-400">Gerencie suas contas e obrigações</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#32e012] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Conta
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar contas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
          >
            <option value="Todos">Todos os Status</option>
            <option value="A Vencer">A Vencer</option>
            <option value="Vencida">Vencida</option>
            <option value="Paga">Paga</option>
          </select>

          <button className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 hover:bg-gray-700 transition-colors flex items-center gap-2">
            <Filter size={20} />
            Filtros
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Conta</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Fornecedor</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Valor</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Vencimento</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Boleto</th>
                <th className="text-left py-4 px-6 font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockContas.map((conta) => (
                <tr key={conta.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium">{conta.nome}</p>
                      <p className="text-sm text-gray-400">{conta.categoria}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">{conta.fornecedor}</td>
                  <td className="py-4 px-6 text-[#39FF14] font-medium">{conta.valor}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {conta.vencimento}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      conta.status === 'Paga' ? 'bg-green-900/30 text-green-400' :
                      conta.status === 'A Vencer' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {conta.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {conta.boleto ? (
                      <span className="text-[#39FF14] flex items-center gap-1">
                        <FileText size={16} />
                        Com Boleto
                      </span>
                    ) : (
                      <span className="text-gray-400">Sem Boleto</span>
                    )}
                  </td>
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

      {/* Modal for new account */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Nova Conta a Pagar</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome da conta"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="text"
                placeholder="Fornecedor"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="text"
                placeholder="Valor (R$)"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
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
