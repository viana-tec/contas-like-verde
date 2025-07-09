/**
 * Hook para operações da API Pagar.me
 * VERSÃO OTIMIZADA COM PROGRESSO DETALHADO E PERSISTÊNCIA NO SUPABASE
 */

import { useToast } from '@/hooks/use-toast';
import { BalanceOperation, Transaction } from '../types';
import { getMockOperations, getMockTransactions } from '../mockData';
import { validateApiKey, mapChargesToOperations, mapTransactions } from '../utils/pagarmeUtils';
import { testConnection, fetchAllDataWithBalance } from '../services/pagarmeService';
import { supabase } from '@/integrations/supabase/client';
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

  // Função para salvar dados no Supabase
  const saveDataToSupabase = async (operations: BalanceOperation[], transactions: Transaction[]) => {
    try {
      console.log('💾 [SUPABASE] Salvando dados no banco...');
      
      // Converter BalanceOperation para formato da tabela pagarme_operations
      const supabaseOperations = operations.map(op => ({
        external_id: op.id,
        type: op.type,
        status: op.status,
        amount: op.amount,
        fee: op.fee || 0,
        payment_method: op.payment_method,
        authorization_code: op.authorization_code,
        tid: op.tid,
        nsu: op.nsu,
        card_brand: op.card_brand,
        card_last_four_digits: op.card_last_four_digits,
        acquirer_name: op.acquirer_name,
        installments: op.installments || 1,
        description: op.description,
        created_at: op.created_at,
        updated_at: op.updated_at || new Date().toISOString(),
        synced_at: new Date().toISOString()
      }));
      
      // Deletar operações antigas
      await supabase.from('pagarme_operations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Inserir novas operações em lotes
      if (supabaseOperations.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < supabaseOperations.length; i += batchSize) {
          const batch = supabaseOperations.slice(i, i + batchSize);
          const { error } = await supabase.from('pagarme_operations').insert(batch);
          
          if (error) {
            console.error(`❌ [SUPABASE] Erro no lote ${i / batchSize + 1}:`, error);
          }
        }
      }

      console.log(`✅ [SUPABASE] ${supabaseOperations.length} operações salvas`);
    } catch (error) {
      console.error('❌ [SUPABASE] Erro ao salvar dados:', error);
    }
  };

  // Função para carregar dados do Supabase
  const loadDataFromSupabase = async () => {
    try {
      console.log('📥 [SUPABASE] Carregando dados salvos...');
      
      const { data: operations, error } = await supabase
        .from('pagarme_operations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [SUPABASE] Erro ao carregar operações:', error);
        return { operations: [], transactions: [] };
      }

      // Converter dados do Supabase para BalanceOperation
      const formattedOperations: BalanceOperation[] = (operations || []).map(op => ({
        id: op.external_id,
        type: op.type,
        status: op.status,
        amount: op.amount,
        fee: op.fee,
        payment_method: op.payment_method,
        authorization_code: op.authorization_code,
        tid: op.tid,
        nsu: op.nsu,
        card_brand: op.card_brand,
        card_last_four_digits: op.card_last_four_digits,
        acquirer_name: op.acquirer_name,
        installments: op.installments,
        description: op.description,
        created_at: op.created_at,
        updated_at: op.updated_at
      }));

      console.log(`📥 [SUPABASE] ${formattedOperations.length} operações carregadas`);
      
      return {
        operations: formattedOperations,
        transactions: [] // Por enquanto só operações
      };
    } catch (error) {
      console.error('❌ [SUPABASE] Erro ao carregar dados:', error);
      return { operations: [], transactions: [] };
    }
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
      // Se não tem API key válida, tentar carregar dados salvos
      const savedData = await loadDataFromSupabase();
      if (savedData.operations.length > 0) {
        setOperations(savedData.operations);
        setTransactions(savedData.transactions);
        setConnectionStatus('connected');
        setErrorDetails('');
        
        toast({
          title: "Dados carregados do cache",
          description: `${savedData.operations.length} operações encontradas no banco de dados`,
        });
        return;
      }
      
      toast({
        title: "Erro",
        description: "Chave API inválida e nenhum dado salvo encontrado.",
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
        setProgressInfo({ stage, current, total, info });
      };

      // Use the combined service function that includes balance data
      const { transactionsData, balanceData, payablesData } = await fetchAllDataWithBalance(apiKey, onProgress);
      
      console.log(`🔄 [FRONTEND] Processando dados recebidos:`, {
        chargesRaw: payablesData.length,
        transactionsRaw: transactionsData.length,
        balance: balanceData
      });
      
      setProgressInfo({ stage: 'Processando dados', current: 4, total: 5, info: 'Formatando operações...' });
      
      // Mapear charges para operações (sem orders)
      const chargeOperations = mapChargesToOperations(payablesData);
      
      // Usar apenas operações de charges
      const allOperations = chargeOperations;
      
      // Converter transações
      const formattedTransactions = mapTransactions(transactionsData);
      
      // Salvar dados no Supabase
      setProgressInfo({ stage: 'Salvando dados', current: 5, total: 5, info: 'Persistindo no banco...' });
      await saveDataToSupabase(allOperations, formattedTransactions);
      
      // Atualizar estados
      setOperations(allOperations);
      setTransactions(formattedTransactions);
      setAvailableBalance(balanceData.available);
      setPendingBalance(balanceData.pending);
      
      console.log(`🎯 [FRONTEND] DADOS PROCESSADOS E SALVOS COM SUCESSO:`, {
        totalOperations: allOperations.length,
        chargeOperations: chargeOperations.length,
        formattedTransactions: formattedTransactions.length,
        saldoDisponivel: balanceData.available,
        saldoPendente: balanceData.pending,
        sampleOperation: allOperations[0],
        sampleTransaction: formattedTransactions[0]
      });
      
      setProgressInfo(null);
      
      toast({
        title: "🎉 Dados carregados e salvos!",
        description: `${allOperations.length} operações sincronizadas com o banco de dados`,
      });
      
    } catch (error: any) {
      console.error('❌ [FRONTEND] Erro buscar dados:', error);
      
      // Em caso de erro, tentar carregar dados salvos
      const savedData = await loadDataFromSupabase();
      if (savedData.operations.length > 0) {
        setOperations(savedData.operations);
        setTransactions(savedData.transactions);
        setConnectionStatus('connected');
        setErrorDetails(`Erro na API: ${error.message}, exibindo dados salvos`);
        
        toast({
          title: "Dados carregados do cache",
          description: `Erro na API, mas ${savedData.operations.length} operações encontradas no banco`,
          variant: "destructive",
        });
      } else {
        setErrorDetails(error.message || 'Erro ao buscar dados');
        setConnectionStatus('error');
        
        toast({
          title: "Erro ao carregar",
          description: error.message || 'Erro desconhecido',
          variant: "destructive",
        });
      }
      
      setProgressInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar dados salvos na inicialização
  const loadSavedData = async () => {
    const savedData = await loadDataFromSupabase();
    if (savedData.operations.length > 0) {
      setOperations(savedData.operations);
      setTransactions(savedData.transactions);
      
      toast({
        title: "Dados restaurados",
        description: `${savedData.operations.length} operações carregadas do banco de dados`,
      });
    }
  };

  return {
    saveApiKey,
    testConnection: handleTestConnection,
    loadDemoData,
    fetchData,
    loadSavedData,
    progressInfo
  };
};
