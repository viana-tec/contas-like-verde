
import { BalanceOperation, Transaction, FinancialIndicators, FilterOptions } from './types';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount / 100);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const getOperationsByType = (operations: BalanceOperation[]) => {
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

export const getMonthlyBalance = (operations: BalanceOperation[]) => {
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

export const calculateFinancialIndicators = (operations: BalanceOperation[], transactions: Transaction[]): FinancialIndicators => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Cálculos básicos
  const totalRevenue = operations
    .filter(op => op.amount > 0)
    .reduce((sum, op) => sum + op.amount, 0);
  
  const totalFees = operations
    .reduce((sum, op) => sum + (op.fee || 0), 0);
  
  const netRevenue = totalRevenue - totalFees;
  
  const totalTransactions = transactions.length;
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Taxa de aprovação
  const paidTransactions = transactions.filter(t => t.status === 'paid').length;
  const approvalRate = totalTransactions > 0 ? (paidTransactions / totalTransactions) * 100 : 0;

  // Taxa de estorno
  const refundedTransactions = transactions.filter(t => t.status === 'refunded').length;
  const refundRate = totalTransactions > 0 ? (refundedTransactions / totalTransactions) * 100 : 0;

  // Percentuais por método de pagamento
  const methodCounts = transactions.reduce((acc, t) => {
    acc[t.payment_method] = (acc[t.payment_method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pixPercentage = totalTransactions > 0 ? ((methodCounts.pix || 0) / totalTransactions) * 100 : 0;
  const creditCardPercentage = totalTransactions > 0 ? ((methodCounts.credit_card || 0) / totalTransactions) * 100 : 0;
  const debitCardPercentage = totalTransactions > 0 ? ((methodCounts.debit_card || 0) / totalTransactions) * 100 : 0;
  const boletoPercentage = totalTransactions > 0 ? ((methodCounts.boleto || 0) / totalTransactions) * 100 : 0;

  // Receita de hoje
  const todayRevenue = operations
    .filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= today && op.amount > 0;
    })
    .reduce((sum, op) => sum + op.amount, 0);

  // Receita do mês
  const monthRevenue = operations
    .filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= monthStart && op.amount > 0;
    })
    .reduce((sum, op) => sum + op.amount, 0);

  // Valores pendentes e disponíveis
  const pendingAmount = operations
    .filter(op => ['pending', 'waiting_funds', 'processing'].includes(op.status))
    .reduce((sum, op) => sum + op.amount, 0);
  
  const availableAmount = operations
    .filter(op => ['paid', 'available'].includes(op.status))
    .reduce((sum, op) => sum + op.amount, 0);

  return {
    totalRevenue,
    totalFees,
    netRevenue,
    totalTransactions,
    averageTicket,
    approvalRate,
    refundRate,
    pixPercentage,
    creditCardPercentage,
    debitCardPercentage,
    boletoPercentage,
    todayRevenue,
    monthRevenue,
    pendingAmount,
    availableAmount
  };
};

export const applyFilters = (
  operations: BalanceOperation[], 
  transactions: Transaction[], 
  filters: FilterOptions
): { operations: BalanceOperation[], transactions: Transaction[] } => {
  let filteredOperations = [...operations];
  let filteredTransactions = [...transactions];

  // Filtro por termo de busca
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filteredOperations = filteredOperations.filter(op => 
      op.id.toLowerCase().includes(term) ||
      op.description?.toLowerCase().includes(term) ||
      op.authorization_code?.toLowerCase().includes(term) ||
      op.tid?.toLowerCase().includes(term) ||
      op.nsu?.toLowerCase().includes(term)
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      t.id.toLowerCase().includes(term) ||
      t.customer?.name?.toLowerCase().includes(term) ||
      t.customer?.email?.toLowerCase().includes(term) ||
      t.authorization_code?.toLowerCase().includes(term) ||
      t.tid?.toLowerCase().includes(term) ||
      t.nsu?.toLowerCase().includes(term)
    );
  }

  // Filtro por data
  if (filters.dateRange.start || filters.dateRange.end) {
    const startDate = filters.dateRange.start;
    const endDate = filters.dateRange.end;
    
    filteredOperations = filteredOperations.filter(op => {
      const opDate = new Date(op.created_at);
      if (startDate && opDate < startDate) return false;
      if (endDate && opDate > endDate) return false;
      return true;
    });
    
    filteredTransactions = filteredTransactions.filter(t => {
      const tDate = new Date(t.created_at);
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
      return true;
    });
  }

  // Filtro por métodos de pagamento
  if (filters.paymentMethods.length > 0) {
    filteredOperations = filteredOperations.filter(op => 
      !op.payment_method || filters.paymentMethods.includes(op.payment_method)
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      filters.paymentMethods.includes(t.payment_method)
    );
  }

  // Filtro por status
  if (filters.statuses.length > 0) {
    filteredOperations = filteredOperations.filter(op => 
      filters.statuses.includes(op.status)
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      filters.statuses.includes(t.status)
    );
  }

  // Filtro por faixa de valor
  if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
    const minAmount = (filters.amountRange.min || 0) * 100; // Converter para centavos
    const maxAmount = filters.amountRange.max ? filters.amountRange.max * 100 : Infinity;
    
    filteredOperations = filteredOperations.filter(op => 
      op.amount >= minAmount && op.amount <= maxAmount
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      t.amount >= minAmount && t.amount <= maxAmount
    );
  }

  // Filtro por adquirente
  if (filters.acquirer) {
    filteredOperations = filteredOperations.filter(op => 
      op.acquirer_name?.toLowerCase() === filters.acquirer.toLowerCase()
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      t.acquirer_name?.toLowerCase() === filters.acquirer.toLowerCase()
    );
  }

  // Filtro por bandeira do cartão
  if (filters.cardBrand) {
    filteredOperations = filteredOperations.filter(op => 
      op.card_brand?.toLowerCase() === filters.cardBrand.toLowerCase()
    );
    
    filteredTransactions = filteredTransactions.filter(t => 
      t.card_brand?.toLowerCase() === filters.cardBrand.toLowerCase()
    );
  }

  return { operations: filteredOperations, transactions: filteredTransactions };
};
