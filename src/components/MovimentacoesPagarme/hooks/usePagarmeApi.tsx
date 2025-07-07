/**
 * Hook customizado para gerenciar estado e operações da API Pagar.me
 */

import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BalanceOperation, Transaction, ConnectionStatus as ConnectionStatusType, FilterOptions } from '../types';
import { getMockOperations, getMockTransactions } from '../mockData';
import { calculateFinancialIndicators, applyFilters } from '../utils';
import { validateApiKey, mapOrdersToOperations, mapTransactions } from '../utils/pagarmeUtils';
import { testConnection, fetchAllData } from '../services/pagarmeService';

export const usePagarmeApi = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [pendingBalance, setPendingBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: null, end: null },
    paymentMethods: [],
    statuses: [],
    amountRange: { min: null, max: null },
    searchTerm: '',
    acquirer: '',
    cardBrand: ''
  });
  
  const { toast } = useToast();

  // Aplicar filtros e calcular indicadores
  const { operations: filteredOperations, transactions: filteredTransactions } = useMemo(() => 
    applyFilters(operations, transactions, filters), 
    [operations, transactions, filters]
  );

  const financialIndicators = useMemo(() => 
    calculateFinancialIndicators(filteredOperations, filteredTransactions),
    [filteredOperations, filteredTransactions]
  );

  const clearFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      paymentMethods: [],
      statuses: [],
      amountRange: { min: null, max: null },
      searchTerm: '',
      acquirer: '',
      cardBrand: ''
    });
  };

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
    
    try {
      await testConnection(apiKey);
      
      setConnectionStatus('connected');
      
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
    
    try {
      const { ordersData, transactionsData, balanceData } = await fetchAllData(apiKey);
      
      // Mapear orders para operações (usando o código correto) 
      const allOperations = mapOrdersToOperations(ordersData);
      
      // Converter transações
      const formattedTransactions = mapTransactions(transactionsData);
      
      // Combinar todas as operações
      setOperations(allOperations);
      setTransactions(formattedTransactions);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);
      
      console.log(`✅ [FRONTEND] Dados carregados com sucesso:`, {
        operations: allOperations.length,
        transactions: formattedTransactions.length,
        availableBalance: balanceData.available,
        pendingBalance: balanceData.pending,
        sampleOperation: allOperations[0],
        sampleTransaction: formattedTransactions[0]
      });
      
      toast({
        title: "Dados carregados com sucesso!",
        description: `${allOperations.length} operações e ${formattedTransactions.length} transações carregadas.`,
      });
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro buscar dados:', error);
      setErrorDetails(error.message || 'Erro ao buscar dados');
      setConnectionStatus('error');
      
      toast({
        title: "Erro ao carregar",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasData = operations.length > 0 || transactions.length > 0;

  return {
    // Estado
    apiKey,
    operations: filteredOperations,
    transactions: filteredTransactions,
    availableBalance,
    pendingBalance,
    loading,
    connectionStatus,
    errorDetails,
    filtersExpanded,
    filters,
    financialIndicators,
    hasData,
    
    // Ações
    setApiKey,
    setFiltersExpanded,
    setFilters,
    clearFilters,
    saveApiKey,
    testConnection: handleTestConnection,
    loadDemoData,
    fetchData
  };
};