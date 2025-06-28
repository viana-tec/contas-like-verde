
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Download, Eye, CreditCard, FileText, Smartphone, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
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
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
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
    setConnectionStatus('idle');
    toast({
      title: "Chave API salva",
      description: "A chave da API foi salva com sucesso.",
    });
  };

  const makeApiRequest = async (endpoint: string) => {
    if (!apiKey) {
      throw new Error('Chave API não configurada');
    }

    console.log(`Tentando fazer requisição para: ${endpoint}`);
    
    // Tentar fazer requisição direta primeiro
    try {
      const response = await fetch(`https://api.pagar.me${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        
        // Tratamento específico para diferentes tipos de erro
        if (response.status === 401) {
          throw new Error('Chave da API inválida. Verifique se a chave está correta.');
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Verifique as permissões da sua chave.');
        } else if (response.status === 429) {
          throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
        }
        
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      return data;
      
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      
      // Se for erro de CORS, mostrar mensagem específica
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        throw new Error('Erro de CORS: A API da Pagar.me não permite requisições diretas do navegador. Para uso em produção, implemente um backend intermediário.');
      }
      
      throw error;
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, configure sua chave da API primeiro.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('connecting');
    setErrorDetails('');
    
    try {
      console.log('Testando conexão com a API Pagar.me...');
      
      // Tentar endpoint de balance primeiro
      const data = await makeApiRequest('/core/v5/balance');
      
      setConnectionStatus('connected');
      toast({
        title: "Conexão estabelecida",
        description: "Conectado com sucesso à API Pagar.me!",
      });
      
      // Se a conexão foi bem-sucedida, buscar os dados
      fetchData();
      
    } catch (error: any) {
      console.error('Erro na conexão:', error);
      setConnectionStatus('error');
      setErrorDetails(error.message);
      
      toast({
        title: "Erro de conexão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDemoData = () => {
    console.log('Carregando dados de demonstração...');
    
    const mockOperations: BalanceOperation[] = [
      {
        id: 'op_clm123456789',
        type: 'payable',
        status: 'paid',
        amount: 15000,
        fee: 450,
        created_at: new Date().toISOString(),
        description: 'Pagamento de cartão de crédito'
      },
      {
        id: 'op_clm987654321',
        type: 'transfer',
        status: 'transferred',
        amount: 8500,
        fee: 0,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        description: 'Transferência para conta bancária'
      },
      {
        id: 'op_clm555666777',
        type: 'fee_collection',
        status: 'available',
        amount: -450,
        fee: 0,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        description: 'Taxa de processamento'
      },
      {
        id: 'op_clm444333222',
        type: 'refund',
        status: 'refunded',
        amount: -2500,
        fee: 0,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        description: 'Estorno de pagamento'
      },
      {
        id: 'op_clm111222333',
        type: 'payable',
        status: 'waiting_funds',
        amount: 12000,
        fee: 360,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        description: 'Pagamento PIX pendente'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: 'tran_abc123456789',
        amount: 15000,
        status: 'paid',
        payment_method: 'credit_card',
        created_at: new Date().toISOString(),
        paid_at: new Date().toISOString()
      },
      {
        id: 'tran_def987654321',
        amount: 12000,
        status: 'processing',
        payment_method: 'pix',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        pix: {
          qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }
      },
      {
        id: 'tran_ghi555666777',
        amount: 8500,
        status: 'paid',
        payment_method: 'boleto',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        paid_at: new Date(Date.now() - 86400000).toISOString(),
        boleto: {
          line: '34191.79001 01043.510047 91020.150008 1 84560000002000',
          pdf: 'https://api.pagar.me/core/v5/transactions/tran_ghi555666777/boleto'
        }
      },
      {
        id: 'tran_jkl444333222',
        amount: 2500,
        status: 'refused',
        payment_method: 'credit_card',
        created_at: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'tran_mno111222333',
        amount: 7800,
        status: 'paid',
        payment_method: 'debit_card',
        created_at: new Date(Date.now() - 259200000).toISOString(),
        paid_at: new Date(Date.now() - 259200000).toISOString()
      }
    ];

    setOperations(mockOperations);
    setTransactions(mockTransactions);
    setConnectionStatus('connected');

    toast({
      title: "Dados de demonstração carregados",
      description: `${mockOperations.length} operações e ${mockTransactions.length} transações de exemplo.`,
    });
  };

  const fetchOperations = async () => {
    try {
      console.log('Buscando operações...');
      const data = await makeApiRequest('/core/v5/balance/operations');
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar operações:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Buscando transações...');
      const data = await makeApiRequest('/core/v5/transactions');
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const [operationsData, transactionsData] = await Promise.all([
        fetchOperations(),
        fetchTransactions()
      ]);
      
      setOperations(operationsData);
      setTransactions(transactionsData);
      
      toast({
        title: "Dados carregados",
        description: `${operationsData.length} operações e ${transactionsData.length} transações carregadas.`,
      });
      
    } catch (error: any) {
      setErrorDetails(error.message);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função alternativa sem proxy (para teste local)
  const testWithoutProxy = async () => {
    if (!apiKey) return;

    setConnectionStatus('connecting');
    setErrorDetails('');

    try {
      // Criar dados fictícios para demonstração
      const mockOperations = [
        {
          id: 'op_123456789',
          type: 'payable',
          status: 'paid',
          amount: 10000,
          fee: 200,
          created_at: new Date().toISOString(),
          description: 'Pagamento recebido'
        },
        {
          id: 'op_987654321',
          type: 'transfer',
          status: 'transferred',
          amount: 5000,
          fee: 100,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          description: 'Transferência bancária'
        }
      ];

      const mockTransactions = [
        {
          id: 'tx_111222333',
          amount: 10000,
          status: 'paid',
          payment_method: 'credit_card',
          created_at: new Date().toISOString(),
          paid_at: new Date().toISOString()
        },
        {
          id: 'tx_444555666',
          amount: 5000,
          status: 'processing',
          payment_method: 'pix',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOperations(mockOperations);
      setTransactions(mockTransactions);
      setConnectionStatus('connected');

      toast({
        title: "Modo demonstração",
        description: "Dados fictícios carregados para demonstração.",
      });

    } catch (error: any) {
      setConnectionStatus('error');
      setErrorDetails(error.message);
    }
  };

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
      available: { label: 'Disponível', variant: 'default' },
      waiting_funds: { label: 'Aguardando', variant: 'secondary' },
      transferred: { label: 'Transferido', variant: 'outline' },
      refunded: { label: 'Estornado', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Conectado';
      case 'connecting': return 'Conectando...';
      case 'error': return 'Erro na conexão';
      default: return 'Não conectado';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle size={20} className="text-green-400" />;
      case 'connecting': return <RefreshCw size={20} className="text-yellow-400 animate-spin" />;
      case 'error': return <XCircle size={20} className="text-red-400" />;
      default: return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  const chartData = getOperationsByType();
  const monthlyData = getMonthlyBalance();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Movimentações Pagar.me</h1>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Chave da API Pagar.me (sk_...)"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white w-full sm:w-64"
          />
          <Button onClick={saveApiKey} className="bg-[#39FF14] text-black hover:bg-[#32E012]">
            Salvar
          </Button>
          <Button 
            onClick={testConnection} 
            disabled={!apiKey || connectionStatus === 'connecting'}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {connectionStatus === 'connecting' ? (
              <RefreshCw size={16} className="animate-spin mr-2" />
            ) : null}
            Testar API
          </Button>
          <Button 
            onClick={loadDemoData} 
            disabled={connectionStatus === 'connecting'}
            className="bg-purple-600 text-white hover:bg-purple-700"
            size="sm"
          >
            Demo
          </Button>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card className="bg-[#1a1a1a] border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getConnectionStatusIcon()}
              <span className={`font-medium ${getConnectionStatusColor()}`}>
                {getConnectionStatusText()}
              </span>
            </div>
            {connectionStatus === 'connected' && (
              <Button 
                onClick={fetchData} 
                disabled={loading}
                size="sm"
                className="bg-[#39FF14] text-black hover:bg-[#32E012]"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : null}
                Atualizar Dados
              </Button>
            )}
          </div>
          {errorDetails && (
            <div className="mt-3 p-4 bg-red-900/20 border border-red-600 rounded-lg">
              <p className="text-red-400 text-sm font-medium mb-2">Erro: {errorDetails}</p>
              <div className="text-gray-400 text-xs space-y-1">
                <p>💡 <strong>Soluções sugeridas:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clique em "Demo" para ver dados de exemplo</li>
                  <li>Verifique se sua chave API está correta</li>
                  <li>Para uso em produção, implemente um backend intermediário</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!apiKey && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <p>Configure sua chave da API Pagar.me para visualizar os dados reais, ou clique em "Demo" para ver dados de exemplo.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {(connectionStatus === 'connected' || (operations.length > 0 && transactions.length > 0)) && (
        <>
          {/* Resumo dos Dados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#39FF14]">{operations.length}</div>
                <p className="text-gray-400">Operações</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#39FF14]">{transactions.length}</div>
                <p className="text-gray-400">Transações</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#39FF14]">
                  {formatCurrency(operations.reduce((sum, op) => sum + op.amount, 0))}
                </div>
                <p className="text-gray-400">Total Operações</p>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#39FF14]">
                  {formatCurrency(transactions.reduce((sum, tx) => sum + tx.amount, 0))}
                </div>
                <p className="text-gray-400">Total Transações</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          {chartData.length > 0 && (
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

              {monthlyData.length > 0 && (
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
              )}
            </div>
          )}

          {/* Tabela de Operações */}
          {operations.length > 0 && (
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
                      {operations.slice(0, 10).map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell className="text-gray-300 font-mono text-xs">
                            {operation.id.substring(0, 12)}...
                          </TableCell>
                          <TableCell className="text-gray-300 capitalize">{operation.type.replace('_', ' ')}</TableCell>
                          <TableCell>{getStatusBadge(operation.status)}</TableCell>
                          <TableCell className={`font-semibold ${
                            operation.amount >= 0 ? 'text-[#39FF14]' : 'text-red-400'
                          }`}>
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
          )}

          {/* Tabela de Transações */}
          {transactions.length > 0 && (
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Transações Recentes</CardTitle>
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
                      {transactions.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-gray-300 font-mono text-xs">
                            {transaction.id.substring(0, 12)}...
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.payment_method)}
                              <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
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
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedTransaction(transaction)}
                                >
                                  <Eye size={14} />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Transação</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-400">ID da Transação</p>
                                    <p className="font-mono text-sm">{transaction.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">Valor</p>
                                    <p className="text-lg font-semibold text-[#39FF14]">
                                      {formatCurrency(transaction.amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">Status</p>
                                    <div className="mt-1">{getStatusBadge(transaction.status)}</div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-400">Método de Pagamento</p>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getPaymentMethodIcon(transaction.payment_method)}
                                      <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                                    </div>
                                  </div>
                                  {transaction.boleto && (
                                    <div>
                                      <p className="text-sm text-gray-400">Linha Digitável</p>
                                      <p className="font-mono text-sm bg-gray-800 p-2 rounded">
                                        {transaction.boleto.line}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm text-gray-400">Data de Criação</p>
                                    <p>{formatDate(transaction.created_at)}</p>
                                  </div>
                                  {transaction.paid_at && (
                                    <div>
                                      <p className="text-sm text-gray-400">Data de Pagamento</p>
                                      <p>{formatDate(transaction.paid_at)}</p>
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
          )}
        </>
      )}

      {/* Mensagem quando não há dados */}
      {operations.length === 0 && transactions.length === 0 && connectionStatus !== 'connecting' && (
        <Card className="bg-[#1a1a1a] border-gray-800">
          <CardContent className="p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum dado disponível</h3>
            <p className="text-gray-400 mb-4">
              Clique em "Demo" para carregar dados de exemplo ou configure sua chave API e teste a conexão.
            </p>
            <Button 
              onClick={loadDemoData}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              Carregar Dados Demo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
