
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Download, Eye, CreditCard, FileText, Smartphone, AlertCircle } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface BalanceOperation {
  id: string;
  type: string;
  status: string;
  amount: number;
  fee?: number;
  created_at: string;
  description?: string;
}

interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at?: string;
  boleto?: {
    line: string;
    pdf: string;
  };
  pix?: {
    qr_code: string;
  };
}

export const MovimentacoesPagarme = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const saveApiKey = () => {
    localStorage.setItem('pagarme_api_key', apiKey);
    toast({
      title: "Chave API salva",
      description: "A chave da API foi salva com sucesso.",
    });
  };

  const fetchOperations = async () => {
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, configure sua chave da API primeiro.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.pagar.me/core/v5/balance/operations', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar operações');
      }

      const data = await response.json();
      setOperations(data.data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar operações. Verifique sua chave da API.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!apiKey) return;

    try {
      const response = await fetch('https://api.pagar.me/core/v5/transactions', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar transações');
      }

      const data = await response.json();
      setTransactions(data.data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar transações.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (apiKey) {
      fetchOperations();
      fetchTransactions();
    }
  }, [apiKey]);

  const getOperationsByType = () => {
    const typeCount: Record<string, { count: number; total: number }> = {};
    operations.forEach(op => {
      if (!typeCount[op.type]) {
        typeCount[op.type] = { count: 0, total: 0 };
      }
      typeCount[op.type].count++;
      typeCount[op.type].total += op.amount;
    });

    return Object.entries(typeCount).map(([type, data]) => ({
      type: type,
      count: data.count,
      total: data.total / 100,
    }));
  };

  const getMonthlyBalance = () => {
    const monthlyData: Record<string, number> = {};
    operations.forEach(op => {
      const month = new Date(op.created_at).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + op.amount;
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: amount / 100,
    }));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard size={16} />;
      case 'boleto':
        return <FileText size={16} />;
      case 'pix':
        return <Smartphone size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: any }> = {
      paid: { label: 'Pago', variant: 'default' },
      processing: { label: 'Processando', variant: 'secondary' },
      refused: { label: 'Recusado', variant: 'destructive' },
      pending: { label: 'Pendente', variant: 'outline' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const chartData = getOperationsByType();
  const monthlyData = getMonthlyBalance();

  const COLORS = ['#39FF14', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Movimentações Pagar.me</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Chave da API Pagar.me"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white w-full sm:w-64"
          />
          <Button onClick={saveApiKey} className="bg-[#39FF14] text-black hover:bg-[#32E012]">
            Salvar Chave
          </Button>
        </div>
      </div>

      {!apiKey && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <p>Configure sua chave da API Pagar.me para visualizar os dados.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {apiKey && (
        <>
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Operações por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    total: { label: "Valor Total", color: "#39FF14" },
                    count: { label: "Quantidade", color: "#4ECDC4" }
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="type" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="total" fill="#39FF14" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Evolução Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    amount: { label: "Valor", color: "#39FF14" }
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="amount" stroke="#39FF14" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter size={20} />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Data Inicial</label>
                  <Input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Data Final</label>
                  <Input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="payable">Pagável</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="fee_collection">Taxa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="available">Disponível</SelectItem>
                      <SelectItem value="waiting_funds">Aguardando</SelectItem>
                      <SelectItem value="transferred">Transferido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Operações */}
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Operações de Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Tipo</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Taxa</TableHead>
                      <TableHead className="text-gray-300">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operations.map((operation) => (
                      <TableRow key={operation.id}>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {operation.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-gray-300">{operation.type}</TableCell>
                        <TableCell>{getStatusBadge(operation.status)}</TableCell>
                        <TableCell className="text-[#39FF14] font-semibold">
                          {formatCurrency(operation.amount)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {operation.fee ? formatCurrency(operation.fee) : '-'}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(operation.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Transações */}
          <Card className="bg-[#1a1a1a] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Transações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Método</TableHead>
                      <TableHead className="text-gray-300">Valor</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Data</TableHead>
                      <TableHead className="text-gray-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {transaction.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="text-gray-300">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(transaction.payment_method)}
                            {transaction.payment_method}
                          </div>
                        </TableCell>
                        <TableCell className="text-[#39FF14] font-semibold">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-gray-300">
                          {formatDate(transaction.created_at)}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                                className="text-[#39FF14] hover:bg-gray-800"
                              >
                                <Eye size={16} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1a1a1a] border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-white">Detalhes da Transação</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm text-gray-400">ID da Transação</label>
                                  <p className="text-white font-mono">{transaction.id}</p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-400">Valor</label>
                                  <p className="text-[#39FF14] font-semibold text-lg">
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm text-gray-400">Status</label>
                                  <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                                </div>
                                {transaction.boleto && (
                                  <div>
                                    <label className="text-sm text-gray-400">Linha Digitável</label>
                                    <p className="text-white font-mono text-sm break-all">
                                      {transaction.boleto.line}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="mt-2"
                                      onClick={() => window.open(transaction.boleto?.pdf)}
                                    >
                                      <Download size={16} className="mr-2" />
                                      Baixar PDF
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
