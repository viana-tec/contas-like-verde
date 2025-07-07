/**
 * Hook para gerenciar estado relacionado à API Pagar.me
 */

import { useState } from 'react';
import { BalanceOperation, Transaction, ConnectionStatus as ConnectionStatusType } from '../types';

export const useApiState = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');

  const hasData = operations.length > 0 || transactions.length > 0;

  return {
    // Estado
    apiKey,
    operations,
    transactions,
    availableBalance,
    pendingBalance,
    loading,
    connectionStatus,
    errorDetails,
    hasData,
    
    // Setters
    setApiKey,
    setOperations,
    setTransactions,
    setAvailableBalance,
    setPendingBalance,
    setLoading,
    setConnectionStatus,
    setErrorDetails
  };
};