
import React, { useState } from 'react';
import { CreditCard, Eye, Download, Calendar, Building2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PagamentoData {
  id: string;
  conta: string;
  fornecedor: string;
  valor: number;
  dataPagamento: string;
  contaBancaria: string;
  comprovante?: string;
  status: 'pago' | 'processando' | 'cancelado';
  categoria: string;
}

const pagamentosData: PagamentoData[] = [
  {
    id: '1',
    conta: 'Energia Elétrica - Janeiro',
    fornecedor: 'CEMIG',
    valor: 890.50,
    dataPagamento: '2024-01-15',
    contaBancaria: 'Banco do Brasil - Conta Corrente',
    comprovante: 'comprovante_001.pdf',
    status: 'pago',
    categoria: 'Utilities'
  },
  {
    id: '2',
    conta: 'Aluguel - Janeiro',
    fornecedor: 'Imobiliária ABC',
    valor: 3500.00,
    dataPagamento: '2024-01-10',
    contaBancaria: 'Itaú - Conta Corrente',
    status: 'pago',
    categoria: 'Imóveis'
  },
  {
    id: '3',
    conta: 'Material de Escritório',
    fornecedor: 'Papelaria XYZ',
    valor: 245.80,
    dataPagamento: '2024-01-20',
    contaBancaria: 'Santander - Conta Corrente',
    status: 'processando',
    categoria: 'Materiais'
  }
];

const statusData = [
  { name: 'Pagos', value: 85, color: '#39FF14' },
  { name: 'Processando', value: 10, color: '#FFA500' },
  { name: 'Cancelados', value: 5, color: '#FF4444' }
];

const monthlyData = [
  { mes: 'Set', valor: 15420 },
  { mes: 'Out', valor: 18350 },
  { mes: 'Nov', valor: 16890 },
  { mes: 'Dez', valor: 22100 },
  { mes: 'Jan', valor: 19750 },
  { mes: 'Fev', valor: 21300 }
];

export const Pagamentos: React.FC = () => {
  const [pagamentos] = useState<PagamentoData[]>(pagamentosData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  const handleExportPDF = () => {
    toast({
      title: "Exportando",
      description: "Gerando relatório de pagamentos em PDF...",
    });
  };

  const handleViewComprovante = (comprovante?: string) => {
    if (comprovante) {
      toast({
        title: "Abrindo comprovante",
        description: `Visualizando ${comprovante}`,
      });
    } else {
      toast({
        title: "Sem comprovante",
        description: "Este pagamento não possui comprovante anexado.",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: 'default',
      processando: 'secondary',
      cancelado: 'destructive'
    };
    
    const labels = {
      pago: 'Pago',
      processando: 'Processando',
      cancelado: 'Cancelado'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const filteredPagamentos = pagamentos.filter(pagamento => {
    const matchesSearch = pagamento.conta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pagamento.fornecedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pagamento.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPago = pagamentos.reduce((sum, p) => p.status === 'pago' ? sum + p.valor : sum, 0);
  const totalProcessando = pagamentos.reduce((sum, p) => p.status === 'processando' ? sum + p.valor : sum, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CreditCard className="h-8 w-8 text-[#39FF14]" />
          <h1 className="text-3xl font-bold">Pagamentos</h1>
        </div>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#39FF14]">{formatCurrency(totalPago)}</div>
            <div className="text-sm text-gray-400">Total Pago</div>
          </div>
        </Card>
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{formatCurrency(totalProcessando)}</div>
            <div className="text-sm text-gray-400">Em Processamento</div>
          </div>
        </Card>
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#39FF14]">{pagamentos.length}</div>
            <div className="text-sm text-gray-400">Total de Pagamentos</div>
          </div>
        </Card>
        <Card className="p-4 bg-gray-900 border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className="text-sm text-gray-400">Contas Bancárias</div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Status dos Pagamentos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Pagamentos por Mês</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="mes" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#39FF14" 
                strokeWidth={3}
                dot={{ fill: '#39FF14', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search">Buscar Pagamento</Label>
          <Input
            id="search"
            placeholder="Conta ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="processando">Processando</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Conta</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Conta Bancária</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPagamentos.map((pagamento) => (
              <TableRow key={pagamento.id}>
                <TableCell className="font-medium">{pagamento.conta}</TableCell>
                <TableCell>{pagamento.fornecedor}</TableCell>
                <TableCell className="text-[#39FF14] font-bold">
                  {formatCurrency(pagamento.valor)}
                </TableCell>
                <TableCell>{new Date(pagamento.dataPagamento).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell className="text-sm text-gray-400">{pagamento.contaBancaria}</TableCell>
                <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleViewComprovante(pagamento.comprovante)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Receipt className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
