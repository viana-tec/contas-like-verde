
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

  // Função para validar formato da chave API
  const validateApiKey = (key: string): boolean => {
    return key.startsWith('sk_') && key.length > 10;
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
        description: "A chave da API deve começar com 'sk_' e ter o formato correto da Pagar.me.",
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
      throw new Error('Formato da chave API inválido. Deve começar com "sk_"');
    }

    console.log(`🚀 Iniciando requisição para: ${endpoint}`);
    console.log(`🔑 Usando chave API: ${apiKey.substring(0, 10)}...`);
    
    try {
      const requestBody = {
        endpoint,
        apiKey
      };
      
      console.log('📤 Enviando dados para Edge Function:', {
        endpoint: endpoint,
        apiKeyLength: apiKey.length,
        apiKeyPrefix: apiKey.substring(0, 5) + '...'
      });

      const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
        body: requestBody
      });

      console.log('📥 Resposta da Edge Function:', { data, error });

      if (error) {
        console.error('❌ Erro na Edge Function:', error);
        
        // Tentar extrair mais informações do erro
        let errorMessage = error.message || 'Erro desconhecido';
        
        if (error.message?.includes('401')) {
          errorMessage = 'Chave API inválida. Verifique se é uma chave SECRET (sk_) válida da Pagar.me';
        } else if (error.message?.includes('403')) {
          errorMessage = 'Acesso negado. Sua chave API não tem as permissões necessárias';
        } else if (error.message?.includes('404')) {
          errorMessage = 'Endpoint não encontrado. Verifique se a URL está correta';
        } else if (error.message?.includes('500')) {
          errorMessage = 'Erro interno da API Pagar.me. Tente novamente em alguns minutos';
        }
        
        throw new Error(errorMessage);
      }

      if (data?.error) {
        console.error('❌ Erro retornado pela API:', data);
        throw new Error(data.details || data.error);
      }

      console.log('✅ Dados recebidos com sucesso:', data);
      return data;
      
    } catch (error: any) {
      console.error('💥 Erro na requisição:', error);
      
      // Melhorar mensagens de erro
      let friendlyMessage = error.message;
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        friendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
      } else if (error.message?.includes('JSON')) {
        friendlyMessage = 'Erro ao processar resposta da API. Tente novamente';
      } else if (error.message?.includes('timeout')) {
        friendlyMessage = 'Tempo limite excedido. Tente novamente';
      }
      
      throw new Error(friendlyMessage);
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
        description: "A chave da API deve começar com 'sk_' e ter o formato correto da Pagar.me.",
        variant: "destructive",
      });
      return;
    }

    setConnectionStatus('connecting');
    setErrorDetails('');
    
    try {
      console.log('🔄 Testando conexão com a API Pagar.me...');
      
      // Primeiro tentar um endpoint simples
      const data = await makeApiRequest('/core/v5/balance');
      
      console.log('✅ Conexão estabelecida com sucesso!');
      setConnectionStatus('connected');
      
      toast({
        title: "Conexão estabelecida",
        description: "Conectado com sucesso à API Pagar.me!",
      });
      
      // Buscar dados automaticamente após conexão bem-sucedida
      await fetchData();
      
    } catch (error: any) {
      console.error('❌ Erro na conexão:', error);
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
    console.log('📊 Carregando dados de demonstração...');
    
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

  const fetchOperations = async () => {
    try {
      console.log('📈 Buscando operações...');
      const data = await makeApiRequest('/core/v5/balance/operations');
      return data.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar operações:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('💳 Buscando transações...');
      const data = await makeApiRequest('/core/v5/transactions');
      return data.data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar transações:', error);
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
      console.log('🔄 Iniciando busca de dados...');
      const [operationsData, transactionsData] = await Promise.all([
        fetchOperations(),
        fetchTransactions()
      ]);
      
      setOperations(operationsData);
      setTransactions(transactionsData);
      
      toast({
        title: "Dados carregados",
        description: `${operationsData.length} operações e ${transactionsData.length} transações carregadas.`,
      });
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar dados:', error);
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
                  Configure sua chave <strong>SECRET</strong> da API Pagar.me (sk_...) para visualizar os dados reais, 
                  ou clique em "Demo" para ver dados de exemplo.
                </p>
                <p className="text-xs mt-2 opacity-75">
                  💡 Certifique-se de usar uma chave SECRET (sk_) e não PUBLIC (pk_)
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
