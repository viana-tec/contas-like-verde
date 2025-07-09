
/**
 * Hook para gerenciar filtros e dados filtrados
 */

import { useState, useMemo } from 'react';
import { BalanceOperation, Transaction, FilterOptions } from '../types';
import { calculateFinancialIndicators, applyFilters } from '../utils';

export const useFilters = (operations: BalanceOperation[], transactions: Transaction[]) => {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: null, end: null },
    paymentMethods: [],
    statuses: [],
    amountRange: { min: null, max: null },
    searchTerm: '',
    acquirer: '',
    cardBrand: ''
  });

  // Aplicar filtros
  const { operations: filteredOperations, transactions: filteredTransactions } = useMemo(() => 
    applyFilters(operations, transactions, filters), 
    [operations, transactions, filters]
  );

  // Calcular indicadores financeiros
  const financialIndicators = useMemo(() => 
    calculateFinancialIndicators(filteredOperations, filteredTransactions),
    [filteredOperations, filteredTransactions]
  );

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      paymentMethods: [],
      statuses: [],
      amountRange: { min: null, max: null },
      searchTerm: '',
      acquirer: '',
      cardBrand: ''
    });
  };

  return {
    // Estado
    filtersExpanded,
    filters,
    filteredOperations,
    filteredTransactions,
    financialIndicators,
    
    // Ações
    setFiltersExpanded,
    setFilters,
    clearFilters
  };
};
