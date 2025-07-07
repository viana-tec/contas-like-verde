
/**
 * Hook principal que compõe todos os hooks menores para gerenciar a API Pagar.me
 * VERSÃO OTIMIZADA COM PROGRESSO DETALHADO
 */

import { useApiState } from './useApiState';
import { useFilters } from './useFilters';
import { useApiOperations } from './useApiOperations';

export const usePagarmeApi = () => {
  // Estado da API
  const apiState = useApiState();
  
  // Filtros e dados filtrados
  const filtersState = useFilters(apiState.operations, apiState.transactions);
  
  // Operações da API
  const apiOperations = useApiOperations({
    apiKey: apiState.apiKey,
    setOperations: apiState.setOperations,
    setTransactions: apiState.setTransactions,
    setAvailableBalance: apiState.setAvailableBalance,
    setPendingBalance: apiState.setPendingBalance,
    setLoading: apiState.setLoading,
    setConnectionStatus: apiState.setConnectionStatus,
    setErrorDetails: apiState.setErrorDetails
  });

  return {
    // Estado da API
    apiKey: apiState.apiKey,
    operations: filtersState.filteredOperations,
    transactions: filtersState.filteredTransactions,
    availableBalance: apiState.availableBalance,
    pendingBalance: apiState.pendingBalance,
    loading: apiState.loading,
    connectionStatus: apiState.connectionStatus,
    errorDetails: apiState.errorDetails,
    hasData: apiState.hasData,
    
    // Estado dos filtros
    filtersExpanded: filtersState.filtersExpanded,
    filters: filtersState.filters,
    financialIndicators: filtersState.financialIndicators,
    
    // Ações da API
    setApiKey: apiState.setApiKey,
    saveApiKey: apiOperations.saveApiKey,
    testConnection: apiOperations.testConnection,
    loadDemoData: apiOperations.loadDemoData,
    fetchData: apiOperations.fetchData,
    loadSavedData: apiOperations.loadSavedData,
    
    // Ações dos filtros
    setFiltersExpanded: filtersState.setFiltersExpanded,
    setFilters: filtersState.setFilters,
    clearFilters: filtersState.clearFilters,
    
    // Progresso detalhado
    progressInfo: apiOperations.progressInfo
  };
};
