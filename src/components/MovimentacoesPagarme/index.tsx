
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BalanceOperation, Transaction, ConnectionStatus as ConnectionStatusType } from './types';
import { ApiConfiguration } from './ApiConfiguration';
import { ConnectionStatus } from './ConnectionStatus';
import { DataSummary } from './DataSummary';
import { ChartsSection } from './ChartsSection';
import { OperationsTable } from './OperationsTable';
import { TransactionsTable } from './TransactionsTable';
import { EmptyState } from './EmptyState';
import { getMockOperations, getMockTransactions } from './mockData';

export const MovimentacoesPagarme = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [operations, setOperations] = useState<BalanceOperation[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const { toast } = useToast();

  // Função para validar formato da chave API Pagar.me
  const validateApiKey = (key: string): boolean => {
    if (!key || typeof key !== 'string') {
      return false;
    }
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
    
    try {
      const requestBody = {
        endpoint,
        apiKey: apiKey.trim()
      };
      
      console.log('📤 [FRONTEND] Enviando para Edge Function:', {
        endpoint: endpoint,
        apiKeyPrefix: apiKey.substring(0, 15) + '...'
      });

      const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
        body: requestBody
      });

      console.log('📥 [FRONTEND] Resposta da Edge Function:', { 
        hasData: !!data, 
        hasError: !!error,
        data: data,
        error: error
      });

      if (error) {
        console.error('❌ [FRONTEND] Erro na Edge Function:', error);
        
        // Tratar diferentes tipos de erro do Supabase
        if (error.message?.includes('non-2xx status code')) {
          throw new Error('Erro na comunicação com a API Pagar.me. Verifique sua chave API.');
        }
        
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
      console.log('🔄 [FRONTEND] Testando conexão...');
      
      // Usar endpoint mais simples para teste
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
      console.log('💰 [FRONTEND] Buscando recebíveis...');
      const data = await makeApiRequest('/core/v5/payables?count=25');
      console.log('📊 [FRONTEND] Recebíveis retornados:', data);
      return data.data || [];
    } catch (error) {
      console.error('❌ [FRONTEND] Erro ao buscar recebíveis:', error);
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
      
      // Buscar apenas payables por enquanto (transações requerem parâmetros específicos)
      const payablesData = await fetchPayables();
      
      console.log('📊 [FRONTEND] Dados processados:', {
        payables: payablesData?.length || 0
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
      setTransactions([]); // Limpar transações por enquanto
      
      toast({
        title: "Dados carregados",
        description: `${operationsFromPayables.length} recebíveis carregados.`,
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
          {transactions.length > 0 && <TransactionsTable transactions={transactions} />}
        </>
      )}

      {!hasData && connectionStatus !== 'connecting' && connectionStatus !== 'connected' && (
        <EmptyState onLoadDemo={loadDemoData} />
      )}
    </div>
  );
};
