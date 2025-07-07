/**
 * Utilitários gerais para o componente MovimentacoesPagarme
 */

import { BalanceOperation, Transaction, FilterOptions, FinancialIndicators } from './types';

// Função para formatar moeda (CORREÇÃO: remover divisão desnecessária por 100)
export const formatCurrency = (value: number): string => {
  // Os valores já vêm convertidos corretamente dos utils (de centavos para reais)
  // Não dividir novamente por 100 aqui!
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Função para formatar data
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Função para formatar data curta
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Função para calcular diferença em dias
export const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Função para verificar se uma data é hoje
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

// Função para verificar se uma data é deste mês
export const isThisMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

// Função para agrupar operações por tipo para gráficos
export const getOperationsByType = (operations: BalanceOperation[]): Array<{
  type: string;
  total: number;
  count: number;
}> => {
  const grouped = operations.reduce((acc, op) => {
    const type = op.payment_method || 'unknown';
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0 };
    }
    acc[type].total += op.amount || 0;
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return Object.entries(grouped).map(([type, data]) => ({
    type: type === 'credit_card' ? 'Cartão' : type === 'pix' ? 'PIX' : type,
    total: data.total,
    count: data.count
  }));
};

// Função para obter dados mensais para gráficos
export const getMonthlyBalance = (operations: BalanceOperation[]): Array<{
  month: string;
  amount: number;
}> => {
  const monthly = operations.reduce((acc, op) => {
    const date = new Date(op.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, amount: 0 };
    }
    acc[monthKey].amount += op.amount || 0;
    return acc;
  }, {} as Record<string, { month: string; amount: number }>);

  return Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
};

// Função para calcular indicadores financeiros
export const calculateFinancialIndicators = (
  operations: BalanceOperation[], 
  transactions: Transaction[]
): FinancialIndicators => {
  console.log('🔍 [INDICADORES] Calculando:', {
    totalOperations: operations.length,
    totalTransactions: transactions.length,
    sampleOperation: operations[0],
    sampleTransaction: transactions[0]
  });
  
  const totalTransactions = transactions.length;
  
  // CORREÇÃO: Considerar apenas transações PAGAS para receita total
  const paidTransactions = transactions.filter(tx => tx.status === 'paid');
  console.log('💰 [INDICADORES] Transações pagas:', paidTransactions.length);
  
  const totalRevenue = paidTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalFees = paidTransactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);
  const netRevenue = totalRevenue - totalFees;
  
  console.log('💰 [INDICADORES] Receitas:', { totalRevenue, totalFees, netRevenue });
  
  // CORREÇÃO: Considerar apenas transações PAGAS para cálculos por método
  const pixTransactions = paidTransactions.filter(tx => tx.payment_method === 'pix');
  const cardTransactions = paidTransactions.filter(tx => tx.payment_method === 'credit_card');
  const debitTransactions = paidTransactions.filter(tx => tx.payment_method === 'debit_card');
  const boletoTransactions = paidTransactions.filter(tx => tx.payment_method === 'boleto');
  
  const pixRevenue = pixTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const cardRevenue = cardTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const debitRevenue = debitTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const boletoRevenue = boletoTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Calcular taxa de aprovação
  const approvedTransactions = transactions.filter(tx => tx.status === 'paid' || tx.status === 'processing');
  const approvalRate = totalTransactions > 0 ? (approvedTransactions.length / totalTransactions) * 100 : 0;
  
  // Calcular taxa de estorno
  const refundedTransactions = transactions.filter(tx => tx.status === 'refunded');
  const refundRate = totalTransactions > 0 ? (refundedTransactions.length / totalTransactions) * 100 : 0;
  
  // Receita de hoje (apenas transações pagas)
  const today = new Date();
  const todayRevenue = paidTransactions
    .filter(tx => isToday(tx.created_at))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  // Receita do mês (apenas transações pagas)
  const monthRevenue = paidTransactions
    .filter(tx => isThisMonth(tx.created_at))
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);
  
  // Valores pendentes e disponíveis
  const pendingOperations = operations.filter(op => op.status === 'waiting_payment' || op.status === 'processing');
  const pendingAmount = pendingOperations.reduce((sum, op) => sum + (op.amount || 0), 0);
  
  const availableOperations = operations.filter(op => op.status === 'paid');
  const availableAmount = availableOperations.reduce((sum, op) => sum + (op.amount || 0), 0);
  
  return {
    totalRevenue,
    totalFees,
    netRevenue,
    totalTransactions,
    averageTicket,
    approvalRate,
    refundRate,
    pixPercentage: totalRevenue > 0 ? (pixRevenue / totalRevenue) * 100 : 0,
    creditCardPercentage: totalRevenue > 0 ? (cardRevenue / totalRevenue) * 100 : 0,
    debitCardPercentage: totalRevenue > 0 ? (debitRevenue / totalRevenue) * 100 : 0,
    boletoPercentage: totalRevenue > 0 ? (boletoRevenue / totalRevenue) * 100 : 0,
    todayRevenue,
    monthRevenue,
    pendingAmount,
    availableAmount
  };
};

// Função para aplicar filtros
export const applyFilters = (
  operations: BalanceOperation[],
  transactions: Transaction[],
  filters: FilterOptions
): { operations: BalanceOperation[]; transactions: Transaction[] } => {
  let filteredOperations = [...operations];
  let filteredTransactions = [...transactions];

  // Filtro por data
  if (filters.dateRange.start || filters.dateRange.end) {
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
    
    filteredOperations = filteredOperations.filter(op => {
      const opDate = new Date(op.created_at);
      if (startDate && opDate < startDate) return false;
      if (endDate && opDate > endDate) return false;
      return true;
    });
    
    filteredTransactions = filteredTransactions.filter(tx => {
      const txDate = new Date(tx.created_at);
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    });
  }

  // Filtro por método de pagamento
  if (filters.paymentMethods.length > 0) {
    filteredOperations = filteredOperations.filter(op => 
      filters.paymentMethods.includes(op.payment_method || '')
    );
    filteredTransactions = filteredTransactions.filter(tx => 
      filters.paymentMethods.includes(tx.payment_method || '')
    );
  }

  // Filtro por status
  if (filters.statuses.length > 0) {
    filteredOperations = filteredOperations.filter(op => 
      filters.statuses.includes(op.status || '')
    );
    filteredTransactions = filteredTransactions.filter(tx => 
      filters.statuses.includes(tx.status || '')
    );
  }

  // Filtro por valor
  if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
    filteredOperations = filteredOperations.filter(op => {
      const amount = op.amount || 0;
      if (filters.amountRange.min !== null && amount < filters.amountRange.min) return false;
      if (filters.amountRange.max !== null && amount > filters.amountRange.max) return false;
      return true;
    });
    
    filteredTransactions = filteredTransactions.filter(tx => {
      const amount = tx.amount || 0;
      if (filters.amountRange.min !== null && amount < filters.amountRange.min) return false;
      if (filters.amountRange.max !== null && amount > filters.amountRange.max) return false;
      return true;
    });
  }

  // Filtro por termo de busca
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filteredOperations = filteredOperations.filter(op => 
      (op.description || '').toLowerCase().includes(searchTerm) ||
      (op.real_code || '').toLowerCase().includes(searchTerm) ||
      (op.id || '').toLowerCase().includes(searchTerm)
    );
    
    filteredTransactions = filteredTransactions.filter(tx => 
      (tx.id || '').toLowerCase().includes(searchTerm) ||
      (tx.real_code || '').toLowerCase().includes(searchTerm)
    );
  }

  // Filtro por adquirente
  if (filters.acquirer) {
    filteredOperations = filteredOperations.filter(op => 
      (op.acquirer_name || '').toLowerCase().includes(filters.acquirer.toLowerCase())
    );
  }

  // Filtro por bandeira do cartão
  if (filters.cardBrand) {
    filteredOperations = filteredOperations.filter(op => 
      (op.card_brand || '').toLowerCase().includes(filters.cardBrand.toLowerCase())
    );
    
    filteredTransactions = filteredTransactions.filter(tx => 
      (tx.card_brand || '').toLowerCase().includes(filters.cardBrand.toLowerCase())
    );
  }

  return {
    operations: filteredOperations,
    transactions: filteredTransactions
  };
};
