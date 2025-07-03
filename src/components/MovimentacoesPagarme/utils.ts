
import { BalanceOperation, Transaction } from './types';

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
