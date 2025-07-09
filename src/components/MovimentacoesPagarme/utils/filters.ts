
/**
 * Utilitários para aplicação de filtros
 */

import { BalanceOperation, Transaction, FilterOptions } from '../types';

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
