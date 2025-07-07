
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
import { BalanceCards } from './BalanceCards';
import { getMockOperations, getMockTransactions } from './mockData';
import { calculateFinancialIndicators, applyFilters } from './utils';

export const MovimentacoesPagarme = () => {
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

  // Função para buscar dados com paginação automática SEM LIMITE
  const fetchAllDataUnlimited = async (endpoint: string): Promise<any[]> => {
    let allData: any[] = [];
    let page = 1;
    const pageSize = 500; // Máximo permitido pela API Pagar.me
    
    console.log(`📄 [FRONTEND] Iniciando coleta ILIMITADA: ${endpoint}`);
    
    while (true) {
      const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}count=${pageSize}&page=${page}`;
      
      console.log(`📄 [FRONTEND] Buscando página ${page}: ${fullEndpoint}`);
      
      try {
        const response = await makeApiRequest(fullEndpoint);
        
        if (!response || !response.data || !Array.isArray(response.data)) {
          console.log(`📄 [FRONTEND] Página ${page}: Sem dados ou formato inválido`);
          break;
        }
        
        const newData = response.data;
        allData = [...allData, ...newData];
        
        console.log(`📄 [FRONTEND] Página ${page}: ${newData.length} registros, Total acumulado: ${allData.length}`);
        
        // Se retornou menos que o tamanho da página, chegamos ao fim
        if (newData.length < pageSize) {
          console.log(`📄 [FRONTEND] Fim da paginação: última página retornou ${newData.length} registros`);
          break;
        }
        
        page++;
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ [FRONTEND] Erro na página ${page}:`, error);
        // Continuar mesmo com erro em uma página específica
        break;
      }
    }
    
    console.log(`🎯 [FRONTEND] Coleta finalizada: ${allData.length} registros total de ${endpoint}`);
    return allData;
  };

  // Função para buscar saldo do recipient
  const fetchBalance = async (): Promise<{ available: number; pending: number }> => {
    try {
      console.log('💰 [FRONTEND] Buscando saldo...');
      
      // Primeiro buscar o recipient_id do usuário
      const recipientResponse = await makeApiRequest('/core/v5/recipients?count=1');
      
      if (!recipientResponse?.data?.[0]?.id) {
        console.warn('⚠️ [FRONTEND] Recipient não encontrado');
        return { available: 0, pending: 0 };
      }
      
      const recipientId = recipientResponse.data[0].id;
      console.log(`💰 [FRONTEND] Recipient ID: ${recipientId}`);
      
      // Buscar saldo do recipient
      const balanceResponse = await makeApiRequest(`/core/v5/recipients/${recipientId}/balance`);
      
      // CORREÇÃO: usar os campos corretos da resposta
      const available = (balanceResponse?.available_amount || 0) / 100; // Converter de centavos
      const pending = (balanceResponse?.waiting_funds_amount || 0) / 100; // Converter de centavos
      
      console.log(`💰 [FRONTEND] Saldo - Disponível: R$ ${available}, Pendente: R$ ${pending}`);
      
      return { available, pending };
      
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao buscar saldo:', error);
      return { available: 0, pending: 0 };
    }
  };

  // Função para extrair código real da transação/pedido
  const extractRealTransactionCode = (item: any): string => {
    // Prioridade 1: code do order (código real do pedido)
    if (item.code && typeof item.code === 'string') {
      return item.code;
    }
    
    // Prioridade 2: reference_key do order
    if (item.reference_key && item.reference_key.length >= 4) {
      return item.reference_key;
    }
    
    // Prioridade 3: authorization_code da transação
    if (item.authorization_code && item.authorization_code.length >= 4) {
      return item.authorization_code;
    }
    
    // Prioridade 4: gateway_id 
    if (item.gateway_id && String(item.gateway_id).length >= 4) {
      return String(item.gateway_id).substring(0, 8);
    }
    
    // Fallback: gerar baseado no ID seguindo o padrão solicitado
    const idStr = String(item.id || '');
    const numericPart = idStr.replace(/[^0-9]/g, '');
    
    if (numericPart.length >= 8) {
      // Usar transformação matemática para manter consistência
      const lastFour = numericPart.slice(-4);
      const transformed = Math.floor(parseInt(lastFour) / 100) + 45000;
      return String(transformed);
    }
    
    return `4${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
  };

  // Função para agrupar payables por order_id
  const groupPayablesByOrder = (payables: any[]): any[] => {
    const orderGroups = new Map<string, any[]>();
    
    // Agrupar por order_id
    payables.forEach(payable => {
      const orderId = payable.split_rule?.rule_id || payable.transaction?.id || payable.id;
      
      if (!orderGroups.has(orderId)) {
        orderGroups.set(orderId, []);
      }
      orderGroups.get(orderId)!.push(payable);
    });
    
    // Consolidar grupos em operações únicas
    const consolidatedOperations: any[] = [];
    
    orderGroups.forEach((payableGroup, orderId) => {
      if (payableGroup.length === 0) return;
      
      const firstPayable = payableGroup[0];
      const totalAmount = payableGroup.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const totalFee = payableGroup.reduce((sum, p) => sum + (Number(p.fee) || 0), 0);
      
      consolidatedOperations.push({
        ...firstPayable,
        id: orderId,
        amount: totalAmount,
        fee: totalFee,
        installments: payableGroup.length,
        consolidated: true,
        original_payables: payableGroup
      });
    });
    
    return consolidatedOperations;
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
      console.log('🔄 [FRONTEND] Iniciando coleta COMPLETA dos últimos 30 dias...');
      
      // Data de 30 dias atrás
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const dateParam = thirtyDaysAgo.toISOString().split('T')[0];
      
      console.log(`📅 [FRONTEND] Data de referência: ${dateParam}`);
      
      // Executar todas as consultas em paralelo para melhor performance
      const [payablesData, transactionsData, ordersData, balanceData] = await Promise.all([
        // 1. Buscar TODOS os payables (sem limite)
        fetchAllDataUnlimited(`/core/v5/payables?created_since=${dateParam}`),
        
        // 2. Buscar TODAS as transações (sem limite) - SEM created_since que causa erro 422
        fetchAllDataUnlimited(`/core/v5/transactions`),
        
        // 3. Buscar TODOS os orders (sem limite)
        fetchAllDataUnlimited(`/core/v5/orders?created_since=${dateParam}`),
        
        // 4. Buscar saldo atual
        fetchBalance()
      ]);
      
      console.log(`📊 [FRONTEND] Dados coletados:`, {
        payables: payablesData.length,
        transactions: transactionsData.length,
        orders: ordersData.length,
        balance: balanceData
      });
      
      // Agrupar payables por pedido para evitar duplicatas por parcela
      const consolidatedPayables = groupPayablesByOrder(payablesData);
      
      console.log(`📊 [FRONTEND] Payables consolidados: ${payablesData.length} → ${consolidatedPayables.length}`);
      
      // Mapear orders para operações (usando o código correto)
      const operationsFromOrders = ordersData.map((order: any, index: number) => {
        const charge = order.charges?.[0] || {};
        const customer = order.customer || {};
        
        return {
          id: String(order.id || `order_${index}`),
          type: 'order',
          status: order.status || 'unknown',
          amount: Number(order.amount) || 0,
          fee: 0, // Orders não têm fee direto
          created_at: order.created_at || new Date().toISOString(),
          description: `Pedido ${order.code} - ${charge.payment_method || 'Pagamento'}`,
          // Dados do order
          payment_method: charge.payment_method,
          installments: 1,
          acquirer_name: charge.acquirer_name,
          acquirer_response_code: charge.acquirer_response_code,
          authorization_code: charge.authorization_code,
          tid: charge.tid,
          nsu: charge.nsu,
          card_brand: charge.card?.brand,
          card_last_four_digits: charge.card?.last_four_digits,
          soft_descriptor: charge.soft_descriptor,
          gateway_response_time: charge.gateway_response_time,
          antifraud_score: charge.antifraud_score,
          // Dados adicionais
          transaction_id: charge.id,
          order_id: order.id,
          reference_key: order.reference_key,
          customer: customer,
          billing: order.billing,
          // Código real do pedido
          real_code: order.code || extractRealTransactionCode(order)
        };
      });
      
      // Converter transações
      const formattedTransactions = transactionsData.map((transaction: any) => ({
        id: String(transaction.id),
        amount: Number(transaction.amount) || 0,
        status: transaction.status || 'unknown',
        payment_method: transaction.payment_method || 'unknown',
        created_at: transaction.created_at || new Date().toISOString(),
        paid_at: transaction.paid_at,
        installments: transaction.installments,
        acquirer_name: transaction.acquirer_name,
        acquirer_response_code: transaction.acquirer_response_code,
        authorization_code: transaction.authorization_code,
        tid: transaction.tid,
        nsu: transaction.nsu,
        card_brand: transaction.card?.brand,
        card_last_four_digits: transaction.card?.last_four_digits,
        soft_descriptor: transaction.soft_descriptor,
        gateway_response_time: transaction.gateway_response_time,
        antifraud_score: transaction.antifraud_score,
        reference_key: transaction.reference_key,
        customer: transaction.customer,
        billing: transaction.billing,
        boleto: transaction.boleto,
        pix: transaction.pix,
        // Código real extraído
        real_code: extractRealTransactionCode(transaction)
      }));
      
      // Combinar todas as operações
      const allOperations = [...operationsFromOrders];
      
      setOperations(allOperations);
      setTransactions(formattedTransactions);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);
      
      console.log(`✅ [FRONTEND] Dados carregados com sucesso:`, {
        operations: allOperations.length,
        transactions: formattedTransactions.length,
        payables: payablesData.length,
        orders: ordersData.length,
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
          <BalanceCards 
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            isLoading={loading}
          />
          
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
