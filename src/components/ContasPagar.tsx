
import React, { useState } from 'react';
import { Plus, Filter, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAccountsPayable } from '@/hooks/useAccountsPayable';
import { AccountPayableForm } from './AccountPayableForm';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ContasPagar: React.FC = () => {
  const { accounts, loading, addAccount, updateAccount, deleteAccount } = useAccountsPayable();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || 
                         (filterStatus === 'A Vencer' && account.status === 'pending') ||
                         (filterStatus === 'Vencida' && account.status === 'overdue') ||
                         (filterStatus === 'Paga' && account.status === 'paid');
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'A Vencer';
      case 'overdue': return 'Vencida';
      case 'paid': return 'Paga';
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleEdit = (accountId: string) => {
    setEditingAccount(accountId);
    setShowModal(true);
  };

  const handleDelete = async (accountId: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      await deleteAccount(accountId);
    }
  };

  const editingAccountData = editingAccount ? accounts.find(acc => acc.id === editingAccount) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contas a Pagar</h1>
          <p className="text-gray-400">Gerencie suas contas e obrigações</p>
        </div>
        <Button 
          onClick={() => {
            setEditingAccount(null);
            setShowModal(true);
          }}
          className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-medium hover:bg-[#32e012] transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Conta
        </Button>
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
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Carregando contas...
          </div>
        ) : (
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
                {filteredAccounts.map((conta) => (
                  <tr key={conta.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium">{conta.description}</p>
                        <p className="text-sm text-gray-400">{conta.category}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">{conta.supplier}</td>
                    <td className="py-4 px-6 text-[#39FF14] font-medium">{formatCurrency(conta.amount)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {formatDate(conta.due_date)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        conta.status === 'paid' ? 'bg-green-900/30 text-green-400' :
                        conta.status === 'pending' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {getStatusLabel(conta.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {conta.has_boleto ? (
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
                        <button 
                          onClick={() => handleEdit(conta.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(conta.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-400">
                      Nenhuma conta encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for new/edit account */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1a1a1a] border border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingAccount ? 'Editar Conta' : 'Nova Conta a Pagar'}
            </DialogTitle>
          </DialogHeader>
          <AccountPayableForm
            onSubmit={editingAccount ? 
              (data) => updateAccount(editingAccount, data) : 
              addAccount
            }
            onCancel={() => setShowModal(false)}
            initialData={editingAccountData || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
