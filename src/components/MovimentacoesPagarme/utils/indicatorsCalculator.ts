
/**
 * Utilitários para cálculo de indicadores financeiros
 */

import { BalanceOperation, Transaction, FinancialIndicators } from '../types';
import { isToday, isThisMonth } from './dateUtils';

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
  
  // CORREÇÃO: Incluir operações de cartão pendente nos cálculos de receita
  const revenueOperations = operations.filter(op => {
    // Incluir operações pagas E operações de cartão pendente
    const isPaid = op.status === 'paid' || op.status === 'available' || op.status === 'transferred';
    const isPendingCard = (op.status === 'pending' || op.status === 'pending_payment' || op.status === 'waiting_payment') && 
                         op.payment_method === 'credit_card';
    return isPaid || isPendingCard;
  });
  
  console.log('💰 [INDICADORES] Operações para receita:', {
    total: revenueOperations.length,
    paid: revenueOperations.filter(op => op.status === 'paid' || op.status === 'available' || op.status === 'transferred').length,
    pendingCard: revenueOperations.filter(op => (op.status === 'pending' || op.status === 'pending_payment' || op.status === 'waiting_payment') && op.payment_method === 'credit_card').length
  });
  
  // Calcular receita baseada em operações (incluindo cartão pendente)
  const totalRevenue = revenueOperations.reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  const totalFees = revenueOperations.reduce((sum, op) => sum + (op.fee || 0), 0);
  const netRevenue = totalRevenue - totalFees;
  
  // Total de transações (incluindo todas, não apenas pagas)
  const totalTransactions = Math.max(operations.length, transactions.length);
  
  console.log('💰 [INDICADORES] Receitas (incluindo cartão pendente):', { totalRevenue, totalFees, netRevenue });
  
  // CORREÇÃO: Usar operações de receita para cálculos por método (incluindo cartão pendente)
  const pixOperations = revenueOperations.filter(op => op.payment_method === 'pix');
  const cardOperations = revenueOperations.filter(op => op.payment_method === 'credit_card');
  const debitOperations = revenueOperations.filter(op => op.payment_method === 'debit_card');
  const boletoOperations = revenueOperations.filter(op => op.payment_method === 'boleto');
  
  const pixRevenue = pixOperations.reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  const cardRevenue = cardOperations.reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  const debitRevenue = debitOperations.reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  const boletoRevenue = boletoOperations.reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
  
  // Calcular taxa de aprovação baseada em operações
  const approvedOperations = operations.filter(op => 
    op.status === 'paid' || op.status === 'processing' || op.status === 'available'
  );
  const approvalRate = operations.length > 0 ? (approvedOperations.length / operations.length) * 100 : 0;
  
  // Calcular taxa de estorno
  const refundedOperations = operations.filter(op => op.status === 'refunded' || op.type === 'refund');
  const refundRate = operations.length > 0 ? (refundedOperations.length / operations.length) * 100 : 0;
  
  // Receita de hoje (incluindo cartão pendente)
  const todayRevenue = revenueOperations
    .filter(op => isToday(op.created_at))
    .reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  
  // Receita do mês (incluindo cartão pendente)
  const monthRevenue = revenueOperations
    .filter(op => isThisMonth(op.created_at))
    .reduce((sum, op) => sum + Math.abs(op.amount || 0), 0);
  
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
