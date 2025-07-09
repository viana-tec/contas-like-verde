
/**
 * Hook para operações da API Pagar.me com progresso detalhado
 */

import { useState } from 'react';
import { BalanceOperation, Transaction, ConnectionStatus } from '../types';
import { 
  fetchPagarmeBalance, 
  fetchPagarmeOperations, 
  fetchPagarmeTransactions,
  testPagarmeConnection 
} from '../services/pagarmeService';
import { generateMockOperations, generateMockTransactions } from '../mockData';
import { mergeOperations } from '../utils/operationMerger';
import { deduplicateOperations } from '../utils/operationDeduplicator';

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
      await testConnection();
    } catch (error: any) {
      console.error('Erro ao salvar chave:', error);
      await setConnectionStatus('error', error.message || 'Erro ao salvar configuração');
    } finally {
      setLoading(false);
      setProgressInfo(undefined);
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      setErrorDetails('Configure uma chave API primeiro');
      return;
    }

    setLoading(true);
    await setConnectionStatus('connecting');
    updateProgress('Testando API...', 1, 1, 'Verificando autenticação');

    try {
      const isValid = await testPagarmeConnection(apiKey);
      
      if (isValid) {
        await setConnectionStatus('connected');
        await saveApiKey(apiKey, 'connected');
        console.log('✅ Conexão estabelecida com sucesso');
      } else {
        throw new Error('Chave API inválida ou sem permissões');
      }
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
      const mockOperations = generateMockOperations();
      const mockTransactions = generateMockTransactions();
      
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
      const balanceData = await fetchPagarmeBalance(apiKey);
      setAvailableBalance(balanceData.available / 100);
      setPendingBalance(balanceData.pending / 100);

      // Buscar operações
      updateProgress('Buscando operações...', 2, 4, 'Consultando operações de saldo');
      const operationsData = await fetchPagarmeOperations(apiKey);
      
      updateProgress('Processando operações...', 3, 4, 'Organizando e mesclando dados');
      const mergedOperations = mergeOperations(operationsData);
      const deduplicatedOperations = deduplicateOperations(mergedOperations);
      setOperations(deduplicatedOperations);

      // Buscar transações
      updateProgress('Buscando transações...', 4, 4, 'Consultando histórico de transações');
      const transactionsData = await fetchPagarmeTransactions(apiKey);
      setTransactions(transactionsData);

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
    testConnection,
    loadDemoData,
    fetchData
  };
};
