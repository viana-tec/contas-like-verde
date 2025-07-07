
import { useState } from 'react';
import { pagarmeService } from '../services/pagarmeService';
import { dataCache } from '../services/dataCache';
import { BalanceOperation, Transaction } from '../types';

interface UseApiOperationsProps {
  apiKey: string;
  setOperations: (operations: BalanceOperation[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAvailableBalance: (balance: number) => void;
  setPendingBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setErrorDetails: (details: string | null) => void;
}

export const useApiOperations = ({
  apiKey,
  setOperations,
  setTransactions,
  setAvailableBalance,
  setPendingBalance,
  setLoading,
  setConnectionStatus,
  setErrorDetails
}: UseApiOperationsProps) => {
  const [progressInfo, setProgressInfo] = useState<{
    current: number;
    total: number;
    step: string;
  } | null>(null);

  const saveApiKey = async (key: string) => {
    try {
      localStorage.setItem('pagarme_api_key', key);
      console.log('✅ Chave API salva com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar chave API:', error);
    }
  };

  const testConnection = async () => {
    if (!apiKey) return;
    
    setLoading(true);
    setConnectionStatus('connecting');
    setErrorDetails(null);

    try {
      const response = await pagarmeService.testConnection(apiKey);
      if (response.success) {
        setConnectionStatus('connected');
        console.log('✅ Conexão testada com sucesso');
      } else {
        setConnectionStatus('error');
        setErrorDetails(response.error || 'Erro desconhecido');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    setLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const { mockOperations, mockTransactions } = await import('../mockData');
      
      setOperations(mockOperations);
      setTransactions(mockTransactions);
      setAvailableBalance(150000);
      setPendingBalance(75000);
      setConnectionStatus('connected');
      
      console.log('✅ Dados de demonstração carregados');
    } catch (error) {
      setConnectionStatus('error');
      setErrorDetails('Erro ao carregar dados de demonstração');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (forceRefresh: boolean = false) => {
    if (!apiKey) return;

    setLoading(true);
    setConnectionStatus('connecting');
    setErrorDetails(null);
    setProgressInfo(null);

    try {
      // Verificar cache primeiro (se não for refresh forçado)
      const cacheKey = dataCache.generateKey(apiKey);
      
      if (!forceRefresh && dataCache.has(cacheKey)) {
        const cachedData = dataCache.get(cacheKey);
        if (cachedData) {
          console.log('📦 Usando dados do cache');
          setOperations(cachedData.operations || []);
          setTransactions(cachedData.transactions || []);
          setAvailableBalance(cachedData.availableBalance || 0);
          setPendingBalance(cachedData.pendingBalance || 0);
          setConnectionStatus('connected');
          setLoading(false);
          return;
        }
      }

      console.log('🔄 Buscando dados da API Pagar.me...');
      
      setProgressInfo({
        current: 1,
        total: 4,
        step: 'Buscando operações de saldo...'
      });

      const operationsResponse = await pagarmeService.getBalanceOperations(apiKey);
      
      if (!operationsResponse.success) {
        throw new Error(operationsResponse.error || 'Erro ao buscar operações');
      }

      setProgressInfo({
        current: 2,
        total: 4,
        step: 'Buscando transações...'
      });

      const transactionsResponse = await pagarmeService.getTransactions(apiKey);
      
      if (!transactionsResponse.success) {
        throw new Error(transactionsResponse.error || 'Erro ao buscar transações');
      }

      setProgressInfo({
        current: 3,
        total: 4,
        step: 'Buscando saldo...'
      });

      const balanceResponse = await pagarmeService.getBalance(apiKey);
      
      if (!balanceResponse.success) {
        throw new Error(balanceResponse.error || 'Erro ao buscar saldo');
      }

      setProgressInfo({
        current: 4,
        total: 4,
        step: 'Finalizando...'
      });

      const operations = operationsResponse.data || [];
      const transactions = transactionsResponse.data || [];
      const balance = balanceResponse.data;

      // Armazenar no cache
      const dataToCache = {
        operations,
        transactions,
        availableBalance: balance?.available?.amount || 0,
        pendingBalance: balance?.waiting_funds?.amount || 0
      };

      dataCache.set(cacheKey, dataToCache, 30 * 60 * 1000); // 30 minutos

      setOperations(operations);
      setTransactions(transactions);
      setAvailableBalance(balance?.available?.amount || 0);
      setPendingBalance(balance?.waiting_funds?.amount || 0);
      setConnectionStatus('connected');
      
      console.log(`✅ Dados carregados: ${operations.length} operações, ${transactions.length} transações`);
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados:', error);
      setConnectionStatus('error');
      setErrorDetails(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setProgressInfo(null);
    }
  };

  return {
    saveApiKey,
    testConnection,
    loadDemoData,
    fetchData,
    progressInfo
  };
};
