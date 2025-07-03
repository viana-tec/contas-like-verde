
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

  const saveApiKey = () => {
    localStorage.setItem('pagarme_api_key', apiKey);
    setConnectionStatus('idle');
    toast({
      title: "Chave API salva",
      description: "A chave da API foi salva com sucesso.",
    });
  };

  const makeApiRequest = async (endpoint: string) => {
    if (!apiKey) {
      throw new Error('Chave API não configurada');
    }

    console.log(`Tentando fazer requisição para: ${endpoint}`);
    
    try {
      const response = await fetch(`https://api.pagar.me${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('Status da resposta:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', errorText);
        
        if (response.status === 401) {
          throw new Error('Chave da API inválida. Verifique se a chave está correta.');
        } else if (response.status === 403) {
          throw new Error('Acesso negado. Verifique as permissões da sua chave.');
        } else if (response.status === 429) {
          throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
        }
        
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      return data;
      
    } catch (error: any) {
      console.error('Erro na requisição:', error);
      
      if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
        throw new Error('Erro de CORS: A API da Pagar.me não permite requisições diretas do navegador. Para uso em produção, implemente um backend intermediário.');
      }
      
      throw error;
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

    setConnectionStatus('connecting');
    setErrorDetails('');
    
    try {
      console.log('Testando conexão com a API Pagar.me...');
      const data = await makeApiRequest('/core/v5/balance');
      
      setConnectionStatus('connected');
      toast({
        title: "Conexão estabelecida",
        description: "Conectado com sucesso à API Pagar.me!",
      });
      
      fetchData();
      
    } catch (error: any) {
      console.error('Erro na conexão:', error);
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
    console.log('Carregando dados de demonstração...');
    
    const mockOperations = getMockOperations();
    const mockTransactions = getMockTransactions();

    setOperations(mockOperations);
    setTransactions(mockTransactions);
    setConnectionStatus('connected');

    toast({
      title: "Dados de demonstração carregados",
      description: `${mockOperations.length} operações e ${mockTransactions.length} transações de exemplo.`,
    });
  };

  const fetchOperations = async () => {
    try {
      console.log('Buscando operações...');
      const data = await makeApiRequest('/core/v5/balance/operations');
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar operações:', error);
      throw error;
    }
  };

  const fetchTransactions = async () => {
    try {
      console.log('Buscando transações...');
      const data = await makeApiRequest('/core/v5/transactions');
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  };

  const fetchData = async () => {
    if (!apiKey) return;

    setLoading(true);
    try {
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
      setErrorDetails(error.message);
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
              <p>Configure sua chave da API Pagar.me para visualizar os dados reais, ou clique em "Demo" para ver dados de exemplo.</p>
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

      {!hasData && connectionStatus !== 'connecting' && (
        <EmptyState onLoadDemo={loadDemoData} />
      )}
    </div>
  );
};
