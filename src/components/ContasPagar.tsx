
import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Conta {
  id: string;
  supplier: string;
  description: string;
  amount: number;
  due_date: string;
  category: string;
  status: string;
  notes?: string;
  payment_date?: string;
}

export const ContasPagar: React.FC = () => {
  const [contas, setContas] = useState<Conta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingConta, setEditingConta] = useState<Conta | null>(null);
  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    amount: '',
    due_date: '',
    category: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchContas();
  }, []);

  const fetchContas = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setContas(data || []);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contas a pagar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.supplier || !formData.description || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const contaData = {
        supplier: formData.supplier,
        description: formData.description,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        category: formData.category || 'Geral',
        notes: formData.notes,
        status: 'pending'
      };

      if (editingConta) {
        const { error } = await supabase
          .from('accounts_payable')
          .update(contaData)
          .eq('id', editingConta.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('accounts_payable')
          .insert([contaData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta adicionada com sucesso!",
        });
      }

      setShowModal(false);
      setFormData({ supplier: '', description: '', amount: '', due_date: '', category: '', notes: '' });
      setEditingConta(null);
      fetchContas();
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conta",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta removida com sucesso!",
      });
      fetchContas();
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (conta: Conta) => {
    setEditingConta(conta);
    setFormData({
      supplier: conta.supplier,
      description: conta.description,
      amount: conta.amount.toString(),
      due_date: conta.due_date,
      category: conta.category,
      notes: conta.notes || ''
    });
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const filteredContas = contas.filter(conta => {
    const matchesSearch = conta.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conta.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || conta.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#39FF14] mx-auto"></div>
          <p className="mt-2 text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Contas a Pagar</h1>
          <p className="text-gray-400">Gerencie suas contas e obrigações</p>
        </div>
        <button 
          onClick={() => {
            setEditingConta(null);
            setFormData({ supplier: '', description: '', amount: '', due_date: '', category: '', notes: '' });
            setShowModal(true);
          }}
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
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="overdue">Vencida</option>
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
                <th className="text-left py-4 px-6 font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContas.map((conta) => (
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
                      {conta.status === 'paid' ? 'Paga' : 
                       conta.status === 'pending' ? 'Pendente' : 'Vencida'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(conta)}
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for new/edit account */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingConta ? 'Editar Conta' : 'Nova Conta a Pagar'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Descrição da conta"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="text"
                placeholder="Fornecedor"
                value={formData.supplier}
                onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="number"
                step="0.01"
                placeholder="Valor (R$)"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <input
                type="text"
                placeholder="Categoria"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors"
              />
              <textarea
                placeholder="Observações (opcional)"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#39FF14] transition-colors h-20 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#39FF14] text-black px-4 py-3 rounded-xl font-medium hover:bg-[#32e012] transition-colors"
                >
                  {editingConta ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
