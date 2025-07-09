
/**
 * Hook principal que compõe todos os hooks menores para gerenciar a API Pagar.me
 * VERSÃO COM ARMAZENAMENTO NO BANCO
 */

import { useApiState } from './useApiState';
import { useFilters } from './useFilters';
import { useApiOperations } from './useApiOperations';
import { useApiConfig } from './useApiConfig';

export const usePagarmeApi = () => {
  // Estado da API
  const apiState = useApiState();
  
  // Configurações da API (salvamento no banco)
  const apiConfig = useApiConfig();
  
  // Filtros e dados filtrados
  const filtersState = useFilters(apiState.operations, apiState.transactions);
  
  // Operações da API
  const apiOperations = useApiOperations({
    apiKey: apiConfig.apiKey,
    setOperations: apiState.setOperations,
    setTransactions: apiState.setTransactions,
    setAvailableBalance: apiState.setAvailableBalance,
    setPendingBalance: apiState.setPendingBalance,
    setLoading: apiState.setLoading,
    setConnectionStatus: apiState.setConnectionStatus,
    setErrorDetails: apiState.setErrorDetails,
    saveApiKey: apiConfig.saveApiKey
  });

  return {
    // Estado da API
    apiKey: apiConfig.apiKey,
    operations: filtersState.filteredOperations,
    transactions: filtersState.filteredTransactions,
    availableBalance: apiState.availableBalance,
    pendingBalance: apiState.pendingBalance,
    loading: apiState.loading,
    connectionStatus: apiConfig.connectionStatus,
    errorDetails: apiConfig.errorDetails,
    hasData: apiState.hasData,
    
    // Estado dos filtros
    filtersExpanded: filtersState.filtersExpanded,
    filters: filtersState.filters,
    financialIndicators: filtersState.financialIndicators,
    
    // Ações da API
    setApiKey: apiConfig.setApiKey,
    saveApiKey: apiConfig.saveApiKey,
    testConnection: apiOperations.testConnection,
    loadDemoData: apiOperations.loadDemoData,
    fetchData: apiOperations.fetchData,
    loadStoredOperations: apiOperations.loadStoredOperations,
    
    // Ações dos filtros
    setFiltersExpanded: filtersState.setFiltersExpanded,
    setFilters: filtersState.setFilters,
    clearFilters: filtersState.clearFilters,
    
    // Progresso detalhado
    progressInfo: apiOperations.progressInfo
  };
};
