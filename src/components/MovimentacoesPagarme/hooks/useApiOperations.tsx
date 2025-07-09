
/**
 * Hook para operações da API Pagar.me
 * VERSÃO OTIMIZADA COM ARMAZENAMENTO NO BANCO
 */

import { useToast } from '@/hooks/use-toast';
import { BalanceOperation, Transaction } from '../types';
import { getMockOperations, getMockTransactions } from '../mockData';
import { validateApiKey, mapOrdersToOperations, mapTransactions, mapPayablesToOperations } from '../utils/pagarmeUtils';
import { testConnection, fetchAllData } from '../services/pagarmeService';
import { mergeOperationsWithoutDuplicates } from '../utils/operationMerger';
import { deduplicateOperations, validateOperationIntegrity } from '../utils/operationDeduplicator';
import { saveOperationsToDatabase, getStoredOperations } from '../services/operationsStorage';
import { useState } from 'react';

interface UseApiOperationsProps {
  apiKey: string;
  setOperations: (operations: BalanceOperation[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setAvailableBalance: (balance: number) => void;
  setPendingBalance: (balance: number) => void;
  setLoading: (loading: boolean) => void;
  setConnectionStatus: (status: any) => void;
  setErrorDetails: (details: string) => void;
  saveApiKey: () => Promise<void>;
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
  const { toast } = useToast();
  
  // Estado para progresso detalhado
  const [progressInfo, setProgressInfo] = useState<{
    stage: string;
    current: number;
    total: number;
    info: string;
  } | null>(null);

  const handleTestConnection = async () => {
    if (!apiKey?.trim()) {
      toast({
        title: "Erro",
        description: "Configure sua chave da API primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast({
        title: "Formato inválido",
        description: "Chave da API em formato inválido.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('connecting');
    setErrorDetails('');
    setProgressInfo({ stage: 'Testando conexão', current: 1, total: 3, info: 'Verificando API...' });
    
    try {
      // Testar conexão
      await testConnection(apiKey);
      
      setProgressInfo({ stage: 'Salvando configuração', current: 2, total: 3, info: 'Salvando chave API...' });
      
      // Salvar a chave API no banco
      await saveApiKey();
      
      setConnectionStatus('connected');
      setProgressInfo({ stage: 'Finalizado', current: 3, total: 3, info: 'Conexão estabelecida!' });
      
      toast({
        title: "Conexão estabelecida",
        description: "API Pagar.me conectada com sucesso!",
      });
      
      // Buscar dados após conectar
      await fetchData();
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro conexão:', error);
      setConnectionStatus('error');
      setErrorDetails(error.message || 'Erro desconhecido');
      setProgressInfo(null);
      
      toast({
        title: "Erro de conexão",
        description: error.message || 'Não foi possível conectar',
        variant: "destructive",
      });
    }
  };

  const loadDemoData = () => {
    console.log('📊 [FRONTEND] Carregando demo...');
    
    try {
      const mockOperations = getMockOperations();
      const mockTransactions = getMockTransactions();

      setOperations(mockOperations);
      setTransactions(mockTransactions);
      setAvailableBalance(125430.50);
      setPendingBalance(45670.25);
      setConnectionStatus('connected');
      setErrorDetails('');

      toast({
        title: "Dados demo carregados",
        description: `${mockOperations.length} operações e ${mockTransactions.length} transações.`,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar demo:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados demo",
        variant: "destructive",
      });
    }
  };

  const loadStoredOperations = async () => {
    try {
      setProgressInfo({ stage: 'Carregando dados salvos', current: 1, total: 1, info: 'Buscando operações...' });
      
      const storedOperations = await getStoredOperations();
      setOperations(storedOperations);
      
      setProgressInfo(null);
      
      if (storedOperations.length > 0) {
        toast({
          title: "Dados carregados",
          description: `${storedOperations.length} operações carregadas do banco de dados.`,
        });
      }
      
      return storedOperations.length > 0;
    } catch (error: any) {
      console.error('❌ [STORAGE] Erro ao carregar dados salvos:', error);
      setProgressInfo(null);
      return false;
    }
  };

  const fetchData = async () => {
    if (!apiKey?.trim() || !validateApiKey(apiKey)) {
      toast({
        title: "Erro",
        description: "Chave API inválida.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrorDetails('');
    setProgressInfo({ stage: 'Iniciando coleta', current: 0, total: 5, info: 'Preparando...' });
    
    try {
      // Função de callback para atualizar progresso
      const onProgress = (stage: string, current: number, total: number, info: string) => {
        setProgressInfo({ stage, current: current + 1, total: 5, info });
      };

      const { ordersData, transactionsData, balanceData, payablesData } = await fetchAllData(apiKey, onProgress);
      
      console.log(`🔄 [FRONTEND] Processando dados recebidos:`, {
        ordersRaw: ordersData.length,
        payablesRaw: payablesData.length,
        transactionsRaw: transactionsData.length,
        balance: balanceData
      });
      
      setProgressInfo({ stage: 'Processando dados', current: 4, total: 5, info: 'Formatando operações...' });
      
      // Mapear orders para operações E payables para operações também 
      const orderOperations = mapOrdersToOperations(ordersData);
      const payableOperations = mapPayablesToOperations(payablesData);
      
      // Combinar operações evitando duplicatas por código
      const mergedOperations = mergeOperationsWithoutDuplicates(orderOperations, payableOperations);
      
      // Aplicar deduplicação final para garantir integridade
      const allOperations = deduplicateOperations(mergedOperations);
      
      // Validar integridade dos dados
      const integrity = validateOperationIntegrity(allOperations);
      if (!integrity.isValid) {
        console.warn('⚠️ [FRONTEND] Problemas de integridade encontrados:', integrity);
      }
      
      // Converter transações
      const formattedTransactions = mapTransactions(transactionsData);
      
      // SALVAR OPERAÇÕES NO BANCO DE DADOS
      setProgressInfo({ stage: 'Salvando no banco', current: 5, total: 5, info: 'Armazenando operações...' });
      
      try {
        await saveOperationsToDatabase(allOperations);
        console.log(`💾 [STORAGE] Operações salvas no banco com sucesso!`);
      } catch (storageError: any) {
        console.warn('⚠️ [STORAGE] Erro ao salvar no banco:', storageError);
        // Continuar mesmo se falhar o armazenamento
      }
      
      // Atualizar estados
      setOperations(allOperations);
      setTransactions(formattedTransactions);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);
      
      console.log(`🎯 [FRONTEND] DADOS PROCESSADOS E SALVOS COM SUCESSO:`, {
        totalOperations: allOperations.length,
        orderOperations: orderOperations.length,
        payableOperations: payableOperations.length,
        formattedTransactions: formattedTransactions.length,
        saldoDisponivel: balanceData.available,
        saldoPendente: balanceData.pending,
        sampleOperation: allOperations[0],
        sampleTransaction: formattedTransactions[0]
      });
      
      setProgressInfo(null);
      
      toast({
        title: "🎉 Dados coletados e salvos!",
        description: `${allOperations.length} operações coletadas e armazenadas no banco!`,
      });
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro buscar dados:', error);
      setErrorDetails(error.message || 'Erro ao buscar dados');
      setConnectionStatus('error');
      setProgressInfo(null);
      
      toast({
        title: "Erro ao carregar",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    testConnection: handleTestConnection,
    loadDemoData,
    fetchData,
    loadStoredOperations,
    progressInfo
  };
};
