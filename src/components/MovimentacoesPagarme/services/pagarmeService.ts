/**
 * Serviços para comunicação com a API do Pagar.me via Supabase Edge Function
 */

import { supabase } from '@/integrations/supabase/client';
import { validateApiKey } from '../utils/pagarmeUtils';

// Função para fazer requisições à API
export const makeApiRequest = async (endpoint: string, apiKey: string) => {
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

// Função para buscar dados com paginação automática SEM LIMITE
export const fetchAllDataUnlimited = async (endpoint: string, apiKey: string): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  const pageSize = 500; // Máximo permitido pela API Pagar.me
  
  console.log(`📄 [FRONTEND] Iniciando coleta ILIMITADA: ${endpoint}`);
  
  while (true) {
    const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}count=${pageSize}&page=${page}`;
    
    console.log(`📄 [FRONTEND] Buscando página ${page}: ${fullEndpoint}`);
    
    try {
      const response = await makeApiRequest(fullEndpoint, apiKey);
      
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
export const fetchBalance = async (apiKey: string): Promise<{ available: number; pending: number }> => {
  try {
    console.log('💰 [FRONTEND] Buscando saldo...');
    
    // Primeiro buscar o recipient_id do usuário
    const recipientResponse = await makeApiRequest('/core/v5/recipients?count=1', apiKey);
    
    if (!recipientResponse?.data?.[0]?.id) {
      console.warn('⚠️ [FRONTEND] Recipient não encontrado');
      return { available: 0, pending: 0 };
    }
    
    const recipientId = recipientResponse.data[0].id;
    console.log(`💰 [FRONTEND] Recipient ID: ${recipientId}`);
    
    // Buscar saldo do recipient
    const balanceResponse = await makeApiRequest(`/core/v5/recipients/${recipientId}/balance`, apiKey);
    
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

// Função para testar conexão
export const testConnection = async (apiKey: string): Promise<void> => {
  console.log('🔄 [FRONTEND] Testando conexão...');
  
  // Teste simples - buscar poucos payables
  const data = await makeApiRequest('/core/v5/payables?count=5', apiKey);
  
  console.log('✅ [FRONTEND] Conexão OK:', data);
};

// Função para buscar todos os dados necessários
export const fetchAllData = async (apiKey: string) => {
  console.log('🔄 [FRONTEND] Iniciando coleta COMPLETA dos últimos 30 dias...');
  
  // Data de 30 dias atrás
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const dateParam = thirtyDaysAgo.toISOString().split('T')[0];
  
  console.log(`📅 [FRONTEND] Data de referência: ${dateParam}`);
  
  // Executar todas as consultas em paralelo para melhor performance
  const [payablesData, transactionsData, ordersData, balanceData] = await Promise.all([
    // 1. Buscar TODOS os payables (sem limite)
    fetchAllDataUnlimited(`/core/v5/payables?created_since=${dateParam}`, apiKey),
    
    // 2. Buscar TODAS as transações (sem limite) - SEM created_since que causa erro 422
    fetchAllDataUnlimited(`/core/v5/transactions`, apiKey),
    
    // 3. Buscar TODOS os orders (sem limite)
    fetchAllDataUnlimited(`/core/v5/orders?created_since=${dateParam}`, apiKey),
    
    // 4. Buscar saldo atual
    fetchBalance(apiKey)
  ]);
  
  console.log(`📊 [FRONTEND] Dados coletados:`, {
    payables: payablesData.length,
    transactions: transactionsData.length,
    orders: ordersData.length,
    balance: balanceData
  });

  return {
    payablesData,
    transactionsData,
    ordersData,
    balanceData
  };
};