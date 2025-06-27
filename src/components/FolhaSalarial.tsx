
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Download, FileSpreadsheet, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface FuncionarioData {
  id: string;
  nome: string;
  funcao: string;
  salario: string;
  diaPagamento1: number;
  diaPagamento2: number;
  chavePix: string;
  criadoEm: string;
}

export const FolhaSalarial: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<FuncionarioData[]>([
    {
      id: '1',
      nome: 'João Silva',
      funcao: 'Desenvolvedor Sênior',
      salario: '8500.00',
      diaPagamento1: 15,
      diaPagamento2: 30,
      chavePix: 'joao.silva@email.com',
      criadoEm: '2024-01-15'
    },
    {
      id: '2',
      nome: 'Maria Santos',
      funcao: 'Gerente Financeiro',
      salario: '12000.00',
      diaPagamento1: 10,
      diaPagamento2: 25,
      chavePix: '+5511999999999',
      criadoEm: '2024-01-20'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioData | null>(null);
  const [formData, setFormData] = useState<Partial<FuncionarioData>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (funcionario?: FuncionarioData) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData(funcionario);
    } else {
      setEditingFuncionario(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.funcao || !formData.salario) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingFuncionario) {
      // Update existing
      setFuncionarios(prev => 
        prev.map(f => f.id === editingFuncionario.id ? { ...f, ...formData } as FuncionarioData : f)
      );
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso!",
      });
    } else {
      // Create new
      const newFuncionario: FuncionarioData = {
        id: Date.now().toString(),
        nome: formData.nome || '',
        funcao: formData.funcao || '',
        salario: formData.salario || '',
        diaPagamento1: formData.diaPagamento1 || 15,
        diaPagamento2: formData.diaPagamento2 || 30,
        chavePix: formData.chavePix || '',
        criadoEm: new Date().toISOString()
      };
      setFuncionarios(prev => [...prev, newFuncionario]);
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso!",
      });
    }

    setIsModalOpen(false);
    setFormData({});
    setEditingFuncionario(null);
  };

  const handleDelete = (id: string) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    toast({
      title: "Sucesso",
      description: "Funcionário removido com sucesso!",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportando",
      description: "Gerando arquivo PDF...",
    });
  };

  const handleExportExcel = () => {
    toast({
      title: "Exportando",
      description: "Gerando arquivo Excel...",
    });
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(parseFloat(value));
  };

  const filteredFuncionarios = funcionarios.filter(funcionario =>
    funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    funcionario.funcao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold">Folha Salarial</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button 
            onClick={() => handleOpenModal()}
            className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Funcionário
          </Button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 md:col-span-2">
          <Label htmlFor="search">Buscar Funcionário</Label>
          <Input
            id="search"
            placeholder="Nome ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#39FF14]">{funcionarios.length}</div>
            <div className="text-sm text-gray-400">Total de Funcionários</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#39FF14]">
              {formatCurrency(funcionarios.reduce((sum, f) => sum + parseFloat(f.salario), 0).toString())}
            </div>
            <div className="text-sm text-gray-400">Folha Total</div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Salário</TableHead>
              <TableHead>1º Pagamento</TableHead>
              <TableHead>2º Pagamento</TableHead>
              <TableHead>Chave PIX</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFuncionarios.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell className="font-medium">{funcionario.nome}</TableCell>
                <TableCell>{funcionario.funcao}</TableCell>
                <TableCell className="text-[#39FF14] font-bold">
                  {formatCurrency(funcionario.salario)}
                </TableCell>
                <TableCell>Dia {funcionario.diaPagamento1}</TableCell>
                <TableCell>Dia {funcionario.diaPagamento2}</TableCell>
                <TableCell className="text-sm text-gray-400">{funcionario.chavePix}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleOpenModal(funcionario)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDelete(funcionario.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="funcao">Função *</Label>
                <Input
                  id="funcao"
                  value={formData.funcao || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, funcao: e.target.value }))}
                  placeholder="Cargo ou função"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salario">Salário *</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  value={formData.salario || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, salario: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dia1">1º Pagamento</Label>
                <Input
                  id="dia1"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaPagamento1 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, diaPagamento1: parseInt(e.target.value) }))}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="dia2">2º Pagamento</Label>
                <Input
                  id="dia2"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.diaPagamento2 || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, diaPagamento2: parseInt(e.target.value) }))}
                  placeholder="30"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="chavePix">Chave PIX</Label>
              <Input
                id="chavePix"
                value={formData.chavePix || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, chavePix: e.target.value }))}
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
              >
                {editingFuncionario ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
