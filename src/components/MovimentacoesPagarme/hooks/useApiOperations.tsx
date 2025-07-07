
/**
 * Hook para operações da API Pagar.me
 * VERSÃO OTIMIZADA COM PROGRESSO DETALHADO
 */

import { useToast } from '@/hooks/use-toast';
import { BalanceOperation, Transaction } from '../types';
import { getMockOperations, getMockTransactions } from '../mockData';
import { validateApiKey, mapOrdersToOperations, mapTransactions, mapPayablesToOperations } from '../utils/pagarmeUtils';
import { testConnection, fetchAllData } from '../services/pagarmeService';
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
  const { toast } = useToast();
  
  // Estado para progresso detalhado
  const [progressInfo, setProgressInfo] = useState<{
    stage: string;
    current: number;
    total: number;
    info: string;
  } | null>(null);

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave API.",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast({
        title: "Formato inválido", 
        description: "A chave da API deve ter pelo menos 10 caracteres válidos.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('pagarme_api_key', apiKey.trim());
    setConnectionStatus('idle');
    setErrorDetails('');
    
    toast({
      title: "Chave API salva",
      description: "A chave da API foi salva com sucesso.",
    });
  };

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
    setProgressInfo({ stage: 'Testando conexão', current: 1, total: 2, info: 'Verificando API...' });
    
    try {
      await testConnection(apiKey);
      
      setConnectionStatus('connected');
      setProgressInfo(null);
      
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
    setProgressInfo({ stage: 'Iniciando coleta', current: 0, total: 4, info: 'Preparando...' });
    
    try {
      // Função de callback para atualizar progresso
      const onProgress = (stage: string, current: number, total: number, info: string) => {
        setProgressInfo({ stage, current, total, info });
      };

      const { ordersData, transactionsData, balanceData, payablesData } = await fetchAllData(apiKey, onProgress);
      
      console.log(`🔄 [FRONTEND] Processando dados recebidos:`, {
        ordersRaw: ordersData.length,
        payablesRaw: payablesData.length,
        transactionsRaw: transactionsData.length,
        balance: balanceData
      });
      
      setProgressInfo({ stage: 'Processando dados', current: 4, total: 4, info: 'Formatando operações...' });
      
      // Mapear orders para operações E payables para operações também 
      const orderOperations = mapOrdersToOperations(ordersData);
      const payableOperations = mapPayablesToOperations(payablesData);
      
      // Combinar todas as operações
      const allOperations = [...orderOperations, ...payableOperations];
      
      // Converter transações
      const formattedTransactions = mapTransactions(transactionsData);
      
      // Atualizar estados
      setOperations(allOperations);
      setTransactions(formattedTransactions);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);
      
      console.log(`🎯 [FRONTEND] DADOS PROCESSADOS COM SUCESSO:`, {
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
        title: "🎉 Dados carregados com sucesso!",
        description: `${allOperations.length} operações e ${formattedTransactions.length} transações coletadas!`,
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
    saveApiKey,
    testConnection: handleTestConnection,
    loadDemoData,
    fetchData,
    progressInfo
  };
};
