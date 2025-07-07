
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BalanceOperation, Transaction, ConnectionStatus as ConnectionStatusType, FilterOptions } from './types';
import { ApiConfiguration } from './ApiConfiguration';
import { ConnectionStatus } from './ConnectionStatus';
import { FinancialIndicators } from './FinancialIndicators';
import { FilterPanel } from './FilterPanel';
import { ChartsSection } from './ChartsSection';
import { OperationsTable } from './OperationsTable';
import { TransactionsTable } from './TransactionsTable';
import { EmptyState } from './EmptyState';
import { getMockOperations, getMockTransactions } from './mockData';
import { calculateFinancialIndicators, applyFilters } from './utils';

export const MovimentacoesPagarme = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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

  // Validação simples da chave API
  const validateApiKey = (key: string): boolean => {
    if (!key || typeof key !== 'string') {
      return false;
    }
    const cleanKey = key.trim();
    return cleanKey.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(cleanKey);
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

  const makeApiRequest = async (endpoint: string) => {
    if (!apiKey?.trim()) {
      throw new Error('Chave API não configurada');
    }

    if (!validateApiKey(apiKey)) {
      throw new Error('Chave API inválida');
    }

    console.log(`🚀 [FRONTEND] Requisição para: ${endpoint}`);
    
    try {
      const requestBody = {
        endpoint: endpoint.trim(),
        apiKey: apiKey.trim()
      };
      
      console.log('📤 [FRONTEND] Enviando para Edge Function');

      const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
        body: requestBody
      });

      console.log('📥 [FRONTEND] Resposta:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMsg: error?.message
      });

      if (error) {
        console.error('❌ [FRONTEND] Erro Supabase:', error);
        throw new Error(error.message || 'Erro na comunicação');
      }

      if (data?.error) {
        console.error('❌ [FRONTEND] Erro API:', data);
        throw new Error(data.details || data.error);
      }

      console.log('✅ [FRONTEND] Sucesso!');
      return data;
      
    } catch (error: any) {
      console.error('💥 [FRONTEND] Erro:', error);
      throw error;
    }
  };

  const testConnection = async () => {
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
      console.log('🔄 [FRONTEND] Testando conexão...');
      
      // Teste simples - buscar poucos payables
      const data = await makeApiRequest('/core/v5/payables?count=5');
      
      console.log('✅ [FRONTEND] Conexão OK:', data);
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
      console.log('🔄 [FRONTEND] Buscando dados...');
      
      // Buscar todos os payables dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateParam = thirtyDaysAgo.toISOString().split('T')[0];
      const payablesData = await makeApiRequest(`/core/v5/payables?count=1000&created_since=${dateParam}`);
      
      if (!payablesData || !payablesData.data) {
        throw new Error('Nenhum dado retornado da API');
      }

      console.log('📊 [FRONTEND] Dados recebidos:', {
        total: payablesData.data?.length || 0,
        firstItem: payablesData.data?.[0] || null
      });
      
      // Converter payables para operations com dados expandidos
      const operationsFromPayables = (payablesData.data || []).map((payable: any, index: number) => ({
        id: String(payable.id || `payable_${index}`),
        type: payable.type || 'credit',
        status: payable.status || 'unknown',
        amount: Number(payable.amount) || 0,
        fee: Number(payable.fee) || 0,
        created_at: payable.created_at || new Date().toISOString(),
        description: `${payable.payment_method || 'Pagamento'} - ${payable.type || 'Credit'}`,
        // Dados expandidos do payable
        payment_method: payable.payment_method || payable.transaction?.payment_method,
        installments: payable.installments || payable.transaction?.installments,
        acquirer_name: payable.acquirer_name || payable.transaction?.acquirer_name,
        acquirer_response_code: payable.acquirer_response_code || payable.transaction?.acquirer_response_code,
        authorization_code: payable.authorization_code || payable.transaction?.authorization_code,
        tid: payable.tid || payable.transaction?.tid,
        nsu: payable.nsu || payable.transaction?.nsu,
        card_brand: payable.card_brand || payable.transaction?.card?.brand,
        card_last_four_digits: payable.card_last_four_digits || payable.transaction?.card?.last_four_digits,
        soft_descriptor: payable.soft_descriptor || payable.transaction?.soft_descriptor,
        gateway_response_time: payable.gateway_response_time || payable.transaction?.gateway_response_time,
        antifraud_score: payable.antifraud_score || payable.transaction?.antifraud_score
      }));
      
      setOperations(operationsFromPayables);
      setTransactions([]); // Limpar transações por enquanto
      
      toast({
        title: "Dados carregados",
        description: `${operationsFromPayables.length} operações carregadas.`,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Movimentações Pagar.me</h1>
        
        <ApiConfiguration
          apiKey={apiKey}
          onApiKeyChange={setApiKey}
          onSaveApiKey={saveApiKey}
          onTestConnection={testConnection}
          onLoadDemo={loadDemoData}
          connectionStatus={connectionStatus}
        />
      </div>

      <ConnectionStatus
        status={connectionStatus}
        errorDetails={errorDetails}
        loading={loading}
        onRefresh={fetchData}
      />

      {!apiKey && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <AlertCircle size={20} />
              <div>
                <p className="font-medium">⚠️ Chave API não configurada</p>
                <p className="text-sm mt-1">
                  Configure sua chave da API Pagar.me para dados reais, 
                  ou clique em "Demo" para dados de exemplo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(connectionStatus === 'connected' || hasData) && (
        <>
          <FinancialIndicators indicators={financialIndicators} isLoading={loading} />
          
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
            isExpanded={filtersExpanded}
            onToggleExpanded={() => setFiltersExpanded(!filtersExpanded)}
          />
          
          <ChartsSection operations={filteredOperations} />
          <OperationsTable operations={filteredOperations} />
          {filteredTransactions.length > 0 && <TransactionsTable transactions={filteredTransactions} />}
        </>
      )}

      {!hasData && connectionStatus !== 'connecting' && connectionStatus !== 'connected' && (
        <EmptyState onLoadDemo={loadDemoData} />
      )}
    </div>
  );
};
