
/**
 * Hook para gerenciar estado relacionado à API Pagar.me
 */

import { useState } from 'react';
import { BalanceOperation, Transaction } from '../types';
import { useApiConfig } from './useApiConfig';

export const useApiState = () => {
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const apiConfig = useApiConfig();

  const hasData = operations.length > 0 || transactions.length > 0;

  return {
    // Estado
    apiKey: apiConfig.apiKey,
    operations,
    transactions,
    availableBalance,
    pendingBalance,
    loading,
    connectionStatus: apiConfig.connectionStatus,
    errorDetails: apiConfig.errorDetails,
    hasData,
    
    // Setters
    setApiKey: apiConfig.setApiKey,
    setOperations,
    setTransactions,
    setAvailableBalance,
    setPendingBalance,
    setLoading,
    setConnectionStatus: apiConfig.updateConnectionStatus,
    setErrorDetails: (error: string) => apiConfig.updateConnectionStatus(apiConfig.connectionStatus, error),
    
    // Funções do banco
    saveApiKey: apiConfig.saveApiConfig,
    loadApiConfig: apiConfig.loadApiConfig,
    isLoadingConfig: apiConfig.isLoading
  };
};
