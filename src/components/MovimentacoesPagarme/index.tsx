
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@supabase/supabase-js';
import { BalanceOperation, Transaction, ConnectionStatus as ConnectionStatusType } from './types';
import { ApiConfiguration } from './ApiConfiguration';
import { ConnectionStatus } from './ConnectionStatus';
import { DataSummary } from './DataSummary';
import { ChartsSection } from './ChartsSection';
import { OperationsTable } from './OperationsTable';
import { TransactionsTable } from './TransactionsTable';
import { EmptyState } from './EmptyState';
import { getMockOperations, getMockTransactions } from './mockData';

// Initialize Supabase client
const supabase = createClient(
  'https://zhnrtxjgimzsezxedtne.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobnJ0eGpnaW16c2V6eGVkdG5lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5MTU3MzIsImV4cCI6MjA1MTQ5MTczMn0.OKbLHSJE6xHGkj8IfP1wfhcDsYZpTOc9eQ7mfJz_Gzs'
);

export const MovimentacoesPagarme = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const { toast } = useToast();

  // Função para validar formato da chave API Pagar.me (baseada na documentação oficial)
  const validateApiKey = (key: string): boolean => {
    if (!key || typeof key !== 'string') {
      return false;
    }
    // Pagar.me aceita diferentes formatos, mas deve ter pelo menos 20 caracteres
    return key.trim().length >= 20;
  };

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave API válida.",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast({
        title: "Formato inválido", 
        description: "A chave da API deve ter pelo menos 20 caracteres.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('pagarme_api_key', apiKey);
    setConnectionStatus('idle');
    setErrorDetails('');
    
    toast({
      title: "Chave API salva",
      description: "A chave da API foi salva com sucesso.",
    });
  };

  const makeApiRequest = async (endpoint: string) => {
    if (!apiKey) {
      throw new Error('Chave API não configurada');
    }

    if (!validateApiKey(apiKey)) {
      throw new Error('Formato da chave API inválido. Deve ter pelo menos 20 caracteres');
    }

    console.log(`🚀 [FRONTEND] Fazendo requisição para: ${endpoint}`);
    console.log(`🔑 [FRONTEND] API Key: ${apiKey.substring(0, 15)}...`);
    
    try {
      const requestBody = {
        endpoint,
        apiKey: apiKey.trim()
      };
      
      console.log('📤 [FRONTEND] Enviando para Edge Function:', {
        endpoint: endpoint,
        apiKeyPrefix: apiKey.substring(0, 15) + '...',
        bodySize: JSON.stringify(requestBody).length
      });

      const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
        body: requestBody
      });

      console.log('📥 [FRONTEND] Resposta da Edge Function:', { 
        hasData: !!data, 
        hasError: !!error,
        dataType: typeof data,
        errorType: typeof error
      });

      if (error) {
        console.error('❌ [FRONTEND] Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com a API');
      }

      if (data?.error) {
        console.error('❌ [FRONTEND] Erro da API Pagar.me:', data);
        throw new Error(data.details || data.error);
      }

      console.log('✅ [FRONTEND] Sucesso! Dados recebidos:', {
        dataType: typeof data,
        hasDataArray: !!data?.data,
        arrayLength: Array.isArray(data?.data) ? data.data.length : 'N/A'
      });
      return data;
      
    } catch (error: any) {
      console.error('💥 [FRONTEND] Erro na requisição:', error);
      throw new Error(error.message || 'Erro desconhecido');
    }
  };

  const testConnection = async () => {
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Por favor, configure sua chave da API primeiro.",
        variant: "destructive",
      });
      return;
    }

    if (!validateApiKey(apiKey)) {
      toast({
        title: "Formato inválido",
        description: "A chave da API deve ter pelo menos 20 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('connecting');
    setErrorDetails('');
    
    try {
      console.log('🔄 [FRONTEND] Testando conexão com endpoint de recebíveis...');
      
      // Usar endpoint de recebíveis conforme documentação oficial
      const data = await makeApiRequest('/core/v5/payables?count=1');
      
      console.log('✅ [FRONTEND] Conexão estabelecida! Dados recebidos:', data);
      setConnectionStatus('connected');
      
      toast({
        title: "Conexão estabelecida",
        description: "Conectado com sucesso à API Pagar.me!",
      });
      
      // Buscar dados automaticamente após conexão bem-sucedida
      await fetchData();
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro na conexão:', error);
      setConnectionStatus('error');
      setErrorDetails(error.message);
      
      toast({
        title: "Erro de conexão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadDemoData = () => {
    console.log('📊 [FRONTEND] Carregando dados de demonstração...');
    
    const mockOperations = getMockOperations();
    const mockTransactions = getMockTransactions();

    setOperations(mockOperations);
    setTransactions(mockTransactions);
    setConnectionStatus('connected');
    setErrorDetails('');

    toast({
      title: "Dados de demonstração carregados",
      description: `${mockOperations.length} operações e ${mockTransactions.length} transações de exemplo.`,
    });
  };

  const fetchPayables = async () => {
    try {
      console.log('💰 [FRONTEND] Buscando recebíveis (payables)...');
      const data = await makeApiRequest('/core/v5/payables?count=25');
      console.log('📊 [FRONTEND] Recebíveis retornados:', data);
      return data.data || [];
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao buscar recebíveis:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('💳 [FRONTEND] Buscando transações...');
      const data = await makeApiRequest('/core/v5/transactions?count=25');
      console.log('📊 [FRONTEND] Transações retornadas:', data);
      return data.data || [];
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao buscar transações:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    if (!apiKey || !validateApiKey(apiKey)) {
      toast({
        title: "Erro",
        description: "Chave API inválida ou não configurada.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrorDetails('');
    
    try {
      console.log('🔄 [FRONTEND] Buscando dados da Pagar.me...');
      
      const [payablesData, transactionsData] = await Promise.all([
        fetchPayables(),
        fetchTransactions()
      ]);
      
      console.log('📊 [FRONTEND] Dados processados:', {
        payables: payablesData?.length || 0,
        transactions: transactionsData?.length || 0
      });
      
      // Converter payables para operations format
      const operationsFromPayables = (payablesData || []).map((payable: any) => ({
        id: payable.id,
        type: payable.type || 'credit',
        status: payable.status,
        amount: payable.amount,
        fee: payable.fee || 0,
        created_at: payable.created_at,
        description: `Recebível - ${payable.type || 'N/A'}`
      }));
      
      setOperations(operationsFromPayables);
      setTransactions(transactionsData || []);
      
      toast({
        title: "Dados carregados",
        description: `${operationsFromPayables.length} recebíveis e ${(transactionsData || []).length} transações carregadas.`,
      });
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro ao buscar dados:', error);
      setErrorDetails(error.message);
      setConnectionStatus('error');
      
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
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
                  Configure sua chave da API Pagar.me para visualizar os dados reais, 
                  ou clique em "Demo" para ver dados de exemplo.
                </p>
                <p className="text-xs mt-2 opacity-75">
                  💡 A chave deve ter pelo menos 20 caracteres e estar ativa no dashboard da Pagar.me
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(connectionStatus === 'connected' || hasData) && (
        <>
          <DataSummary operations={operations} transactions={transactions} />
          <ChartsSection operations={operations} />
          <OperationsTable operations={operations} />
          <TransactionsTable transactions={transactions} />
        </>
      )}

      {!hasData && connectionStatus !== 'connecting' && connectionStatus !== 'connected' && (
        <EmptyState onLoadDemo={loadDemoData} />
      )}
    </div>
  );
};
