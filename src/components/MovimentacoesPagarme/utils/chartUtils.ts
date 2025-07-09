
/**
 * Utilitários para processamento de dados de gráficos
 */

import { BalanceOperation } from '../types';

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
