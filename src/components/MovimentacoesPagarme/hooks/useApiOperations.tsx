
import { useState } from 'react';
import { fetchAllData, testConnection as testApiConnection } from '../services/pagarmeService';
import { dataCache } from '../services/dataCache';
import { getMockOperations, getMockTransactions } from '../mockData';
import { BalanceOperation, Transaction, ConnectionStatus } from '../types';

interface UseApiOperationsProps {
  apiKey: string;
  setOperations: (operations: BalanceOperation[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAvailableBalance: (balance: number) => void;
  setPendingBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
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
    stage: string;
    current: number;
    total: number;
    info: string;
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
      await testApiConnection(apiKey);
      setConnectionStatus('connected');
      console.log('✅ Conexão testada com sucesso');
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
      const mockOperations = getMockOperations();
      const mockTransactions = getMockTransactions();
      
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
      
      const onProgress = (stage: string, current: number, total: number, info: string) => {
        setProgressInfo({ stage, current, total, info });
      };

      const data = await fetchAllData(apiKey, onProgress, forceRefresh);

      const operations = data.payablesData || [];
      const transactions = data.transactionsData || [];
      const balance = data.balanceData;

      // Armazenar no cache
      const dataToCache = {
        operations,
        transactions,
        availableBalance: balance?.available || 0,
        pendingBalance: balance?.pending || 0
      };

      dataCache.set(cacheKey, dataToCache, 30 * 60 * 1000); // 30 minutos

      setOperations(operations);
      setTransactions(transactions);
      setAvailableBalance(balance?.available || 0);
      setPendingBalance(balance?.pending || 0);
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
