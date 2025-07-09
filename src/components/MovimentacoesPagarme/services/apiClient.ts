/**
 * Core API client for Pagar.me communication
 * Handles request lifecycle, caching, and retry logic
 * CORRIGIDO PARA PAYABLES
 */

import { supabase } from '@/integrations/supabase/client';
import { validateApiKey } from '../utils/pagarmeUtils';

// Cache inteligente para evitar re-coletas desnecessárias
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para fazer requisições à API com retry inteligente
export const makeApiRequest = async (endpoint: string, apiKey: string, retryCount = 0): Promise<any> => {
  if (!apiKey?.trim()) {
    throw new Error('Chave API não configurada');
  }

  if (!validateApiKey(apiKey)) {
    throw new Error('Chave API inválida');
  }

  const cacheKey = `${apiKey}_${endpoint}`;
  const cached = dataCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    console.log(`📦 [CACHE] Usando dados em cache para: ${endpoint}`);
    return cached.data;
  }

  console.log(`🚀 [API] Requisição para: ${endpoint} (tentativa ${retryCount + 1})`);
  
  try {
    const requestBody = {
      endpoint: endpoint.trim(),
      apiKey: apiKey.trim()
    };
    
    const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
      body: requestBody
    });

    if (error) {
      console.error('❌ [API] Erro Supabase:', error);
      throw new Error(error.message || 'Erro na comunicação');
    }

    if (data?.error) {
      console.error('❌ [API] Erro API:', data);
      
      // Retry para rate limit
      if ((data.error.includes('429') || data.error.includes('rate') || data.error.includes('Limite')) && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 3000; // Backoff exponencial maior
        console.log(`⏳ [RETRY] Aguardando ${delay}ms antes da tentativa ${retryCount + 2}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeApiRequest(endpoint, apiKey, retryCount + 1);
      }
      
      throw new Error(data.details || data.error);
    }

    // Cache da resposta
    dataCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    });

    console.log('✅ [API] Sucesso!');
    return data;
    
  } catch (error: any) {
    if (retryCount < 2 && !error.message?.includes('inválida')) {
      const delay = 2000 * (retryCount + 1);
      console.log(`🔄 [RETRY] Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(endpoint, apiKey, retryCount + 1);
    }
    
    console.error('💥 [API] Erro final:', error);
    throw error;
  }
};

// Função para testar conexão - API v5 CORRIGIDA PARA PAYABLES
export const testConnection = async (apiKey: string): Promise<void> => {
  console.log('🔄 [TESTE] Testando conexão com endpoint de payables...');
  const data = await makeApiRequest('/core/v5/payables?count=5', apiKey);
  console.log('✅ [TESTE] Conexão OK com payables:', data);
};

// Função para buscar detalhes de uma transação específica - API v5 CORRIGIDA
export const fetchTransactionDetails = async (transactionId: string, apiKey: string): Promise<any> => {
  console.log(`🔍 [TRANSACTION] Buscando detalhes de: ${transactionId}`);
  
  try {
    // Primeiro, tentar buscar como charge
    try {
      const chargeData = await makeApiRequest(`/core/v5/charges/${transactionId}`, apiKey);
      console.log(`✅ [TRANSACTION] Encontrado como charge: ${chargeData.status}`);
      return chargeData;
    } catch (chargeError) {
      console.log(`⚠️ [TRANSACTION] Não encontrado como charge, tentando como order...`);
    }
    
    // Se não encontrar como charge, tentar como order
    try {
      const orderData = await makeApiRequest(`/core/v5/orders/${transactionId}`, apiKey);
      console.log(`✅ [TRANSACTION] Encontrado como order: ${orderData.status}`);
      return orderData;
    } catch (orderError) {
      console.log(`⚠️ [TRANSACTION] Não encontrado como order, tentando como transaction...`);
    }
    
    // Última tentativa: como transaction
    const transactionData = await makeApiRequest(`/core/v5/transactions/${transactionId}`, apiKey);
    console.log(`✅ [TRANSACTION] Encontrado como transaction: ${transactionData.status}`);
    return transactionData;
    
  } catch (error) {
    console.error(`❌ [TRANSACTION] Erro ao buscar ${transactionId}:`, error);
    throw error;
  }
};
