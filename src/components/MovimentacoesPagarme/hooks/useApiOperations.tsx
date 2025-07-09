
import { useState } from 'react';
import { BalanceOperation, Transaction, ConnectionStatus } from '../types';
import { 
  fetchBalance, 
  fetchAllData,
  testConnection 
} from '../services/pagarmeService';
import { getMockOperations, getMockTransactions } from '../mockData';

interface UseApiOperationsProps {
  apiKey: string;
  setOperations: (operations: BalanceOperation[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAvailableBalance: (balance: number) => void;
  setPendingBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus, error?: string) => Promise<void>;
  setErrorDetails: (error: string) => void;
  saveApiKey: (apiKey: string, status?: ConnectionStatus, error?: string) => Promise<boolean>;
}

interface ProgressInfo {
  stage: string;
  current: number;
  total: number;
  info: string;
}

export const useApiOperations = ({
  apiKey,
  setOperations,
  setTransactions,
  setAvailableBalance,
  setPendingBalance,
  setLoading,
  setConnectionStatus,
  setErrorDetails,
  saveApiKey
}: UseApiOperationsProps) => {
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | undefined>();

  const updateProgress = (stage: string, current: number, total: number, info: string) => {
    setProgressInfo({ stage, current, total, info });
  };

  const saveApiKeyAndTest = async () => {
    if (!apiKey.trim()) {
      setErrorDetails('Chave API é obrigatória');
      return;
    }

    setLoading(true);
    updateProgress('Salvando configuração...', 1, 2, 'Salvando chave API no banco de dados');

    try {
      const success = await saveApiKey(apiKey, 'idle');
      if (!success) {
        throw new Error('Erro ao salvar configuração no banco');
      }

      updateProgress('Testando conexão...', 2, 2, 'Verificando conectividade com a API');
      await testConnectionInternal();
    } catch (error: any) {
      console.error('Erro ao salvar chave:', error);
      await setConnectionStatus('error', error.message || 'Erro ao salvar configuração');
    } finally {
      setLoading(false);
      setProgressInfo(undefined);
    }
  };

  const testConnectionInternal = async () => {
    if (!apiKey) {
      setErrorDetails('Configure uma chave API primeiro');
      return;
    }

    setLoading(true);
    await setConnectionStatus('connecting');
    updateProgress('Testando API...', 1, 1, 'Verificando autenticação');

    try {
      await testConnection(apiKey);
      
      await setConnectionStatus('connected');
      await saveApiKey(apiKey, 'connected');
      console.log('✅ Conexão estabelecida com sucesso');
    } catch (error: any) {
      console.error('❌ Erro no teste de conexão:', error);
      await setConnectionStatus('error', error.message);
      await saveApiKey(apiKey, 'error', error.message);
    } finally {
      setLoading(false);
      setProgressInfo(undefined);
    }
  };

  const loadDemoData = async () => {
    setLoading(true);
    await setConnectionStatus('connecting');
    updateProgress('Carregando dados demo...', 1, 3, 'Gerando operações de exemplo');

    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateProgress('Processando operações...', 2, 3, 'Organizando dados demo');
      const mockOperations = getMockOperations();
      const mockTransactions = getMockTransactions();
      
      updateProgress('Finalizando...', 3, 3, 'Aplicando dados demo');
      setOperations(mockOperations);
      setTransactions(mockTransactions);
      setAvailableBalance(125450.89);
      setPendingBalance(23567.12);
      
      await setConnectionStatus('connected');
      console.log('✅ Dados demo carregados');
    } catch (error: any) {
      console.error('❌ Erro ao carregar demo:', error);
      await setConnectionStatus('error', error.message);
    } finally {
      setLoading(false);
      setProgressInfo(undefined);
    }
  };

  const fetchData = async () => {
    if (!apiKey) {
      setErrorDetails('Configure uma chave API primeiro');
      return;
    }

    setLoading(true);
    await setConnectionStatus('connecting');

    try {
      // Buscar saldo
      updateProgress('Buscando saldo...', 1, 4, 'Consultando saldo disponível');
      const balanceData = await fetchBalance(apiKey);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);

      // Buscar todos os dados
      updateProgress('Buscando dados...', 2, 4, 'Consultando operações e transações');
      const allData = await fetchAllData(apiKey, updateProgress);
      
      updateProgress('Processando dados...', 3, 4, 'Organizando dados coletados');
      setOperations(allData.payablesData);
      setTransactions(allData.transactionsData);

      updateProgress('Finalizando...', 4, 4, 'Concluindo sincronização');
      await setConnectionStatus('connected');
      await saveApiKey(apiKey, 'connected');
      console.log('✅ Dados carregados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao buscar dados:', error);
      await setConnectionStatus('error', error.message);
      await saveApiKey(apiKey, 'error', error.message);
    } finally {
      setLoading(false);
      setProgressInfo(undefined);
    }
  };

  return {
    progressInfo,
    saveApiKey: saveApiKeyAndTest,
    testConnection: testConnectionInternal,
    loadDemoData,
    fetchData
  };
};
