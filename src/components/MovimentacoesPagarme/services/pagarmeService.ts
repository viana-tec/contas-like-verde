/**
 * Serviços para comunicação com a API do Pagar.me via Supabase Edge Function
 * VERSÃO OTIMIZADA COM CACHE E COLETA INTELIGENTE
 */

import { supabase } from '@/integrations/supabase/client';
import { validateApiKey } from '../utils/pagarmeUtils';
import { dataCache } from './dataCache';

// Função para fazer requisições à API com cache inteligente
export const makeApiRequest = async (endpoint: string, apiKey: string, retryCount = 0): Promise<any> => {
  if (!apiKey?.trim()) {
    throw new Error('Chave API não configurada');
  }

  if (!validateApiKey(apiKey)) {
    throw new Error('Chave API inválida');
  }

  // Verificar cache primeiro
  const cacheKey = dataCache.generateKey(apiKey, endpoint);
  const cachedData = dataCache.get(cacheKey);
  
  if (cachedData) {
    console.log(`📦 [CACHE] Usando dados em cache para: ${endpoint}`);
    return cachedData;
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
        const delay = Math.pow(2, retryCount) * 2000;
        console.log(`⏳ [RETRY] Aguardando ${delay}ms antes da tentativa ${retryCount + 2}...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeApiRequest(endpoint, apiKey, retryCount + 1);
      }
      
      throw new Error(data.details || data.error);
    }

    // Armazenar no cache (15 minutos para dados dinâmicos)
    dataCache.set(cacheKey, data, 15 * 60 * 1000);

    console.log('✅ [API] Sucesso!');
    return data;
    
  } catch (error: any) {
    if (retryCount < 2 && !error.message?.includes('inválida')) {
      const delay = 1000 * (retryCount + 1);
      console.log(`🔄 [RETRY] Tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeApiRequest(endpoint, apiKey, retryCount + 1);
    }
    
    console.error('💥 [API] Erro final:', error);
    throw error;
  }
};

// Função para buscar dados com paginação MASSIVA E OTIMIZADA
export const fetchAllDataUnlimited = async (
  endpoint: string, 
  apiKey: string,
  onProgress?: (current: number, total: number, info: string) => void
): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  let pageSize = 100; // API v5 usa 'size' e max 100
  let maxPages = 1000; // Permitir mais páginas para coleta completa
  let consecutiveEmptyPages = 0;
  const maxConsecutiveEmpty = 3;
  
  console.log(`📄 [COLETA] Iniciando coleta MASSIVA v5: ${endpoint}`);
  
  while (page <= maxPages && consecutiveEmptyPages < maxConsecutiveEmpty) {
    // API v5 usa 'size' e 'page' (não 'count')
    const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}size=${pageSize}&page=${page}`;
    
    onProgress?.(page, maxPages, `Coletando página ${page}...`);
    console.log(`📄 [COLETA] Página ${page}/${maxPages}: ${fullEndpoint}`);
    
    try {
      const response = await makeApiRequest(fullEndpoint, apiKey);
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.log(`📄 [COLETA] Página ${page}: Formato inválido`);
        consecutiveEmptyPages++;
        page++;
        continue;
      }
      
      const newData = response.data;
      
      if (newData.length === 0) {
        consecutiveEmptyPages++;
        console.log(`📄 [COLETA] Página ${page}: Vazia (${consecutiveEmptyPages}/${maxConsecutiveEmpty})`);
        
        if (consecutiveEmptyPages >= maxConsecutiveEmpty) {
          console.log(`📄 [COLETA] Parando após ${maxConsecutiveEmpty} páginas vazias consecutivas`);
          break;
        }
        
        page++;
        continue;
      }
      
      consecutiveEmptyPages = 0; // Reset contador
      allData = [...allData, ...newData];
      
      console.log(`📄 [COLETA] Página ${page}: +${newData.length} registros (Total: ${allData.length})`);
      
      if (newData.length < pageSize) {
        console.log(`📄 [COLETA] Última página: ${newData.length} < ${pageSize}`);
        break;
      }
      
      page++;
      
      // Pausa otimizada para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error: any) {
      console.error(`❌ [COLETA] Erro na página ${page}:`, error);
      
      if (error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('Limite')) {
        console.log(`📄 [RATE_LIMIT] Aguardando 5s...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue; // Tentar a mesma página novamente
      }
      
      // Para outros erros, tentar próxima página
      page++;
      consecutiveEmptyPages++;
      
      if (consecutiveEmptyPages >= maxConsecutiveEmpty) break;
    }
  }
  
  onProgress?.(maxPages, maxPages, `Finalizado: ${allData.length} registros`);
  console.log(`🎯 [COLETA] FINALIZADA: ${allData.length} registros de ${endpoint}`);
  return allData;
};

// Função para buscar saldo com CORREÇÃO definitiva - API v5
export const fetchBalance = async (apiKey: string): Promise<{ available: number; pending: number }> => {
  try {
    console.log('💰 [SALDO] Buscando saldo...');
    
    const recipientResponse = await makeApiRequest('/core/v5/recipients?size=1', apiKey);
    
    if (!recipientResponse?.data?.[0]?.id) {
      console.warn('⚠️ [SALDO] Recipient não encontrado');
      return { available: 0, pending: 0 };
    }
    
    const recipientId = recipientResponse.data[0].id;
    console.log(`💰 [SALDO] Recipient ID: ${recipientId}`);
    
    const balanceResponse = await makeApiRequest(`/core/v5/recipients/${recipientId}/balance`, apiKey);
    
    // CORREÇÃO DEFINITIVA: Valores vêm em centavos, converter para reais
    const available = (balanceResponse?.available_amount || 0) / 100;
    const pending = (balanceResponse?.waiting_funds_amount || 0) / 100;
    
    console.log(`💰 [SALDO] CORRETO - Disponível: R$ ${available.toFixed(2)}, Pendente: R$ ${pending.toFixed(2)}`);
    
    return { available, pending };
    
  } catch (error) {
    console.error('❌ [SALDO] Erro:', error);
    return { available: 0, pending: 0 };
  }
};

// Função para testar conexão - API v5
export const testConnection = async (apiKey: string): Promise<void> => {
  console.log('🔄 [TESTE] Testando conexão...');
  const data = await makeApiRequest('/core/v5/payables?size=5', apiKey);
  console.log('✅ [TESTE] Conexão OK:', data);
};

// Função OTIMIZADA para buscar dados com cache inteligente
export const fetchAllData = async (
  apiKey: string, 
  onProgress?: (stage: string, current: number, total: number, info: string) => void,
  forceRefresh: boolean = false
) => {
  console.log('🚀 [MASTER] Iniciando coleta otimizada com cache...');
  
  const masterCacheKey = dataCache.generateKey(apiKey, 'master_data');
  
  // Se não for refresh forçado, tentar usar cache
  if (!forceRefresh) {
    const cachedMasterData = dataCache.get(masterCacheKey);
    if (cachedMasterData) {
      console.log('📦 [MASTER] Usando dados completos do cache');
      onProgress?.('Cache', 4, 4, 'Dados carregados do cache');
      return cachedMasterData;
    }
  }

  // Período otimizado - últimos 6 meses para otimizar performance
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateParam = sixMonthsAgo.toISOString().split('T')[0];
  
  console.log(`📅 [MASTER] Período otimizado: ${dateParam} até hoje (6 meses)`);
  
  try {
    // FASE 1: Coleta PARALELA OTIMIZADA
    console.log('🚀 [FASE 1] Iniciando coleta paralela otimizada...');
    onProgress?.('Coletando dados', 1, 4, 'Iniciando coleta de todos os endpoints...');
    
    const endpoints = [
      { name: 'payables', url: `/core/v5/payables?created_since=${dateParam}` },
      { name: 'orders', url: `/core/v5/orders?created_since=${dateParam}&status=paid,processing,waiting_payment` },
      { name: 'transactions', url: `/core/v5/transactions?created_since=${dateParam}` }
    ];
    
    const results = await Promise.allSettled(
      endpoints.map(async (ep, index) => {
        onProgress?.('Coletando dados', index + 1, 4, `Coletando ${ep.name}...`);
        const data = await fetchAllDataUnlimited(ep.url, apiKey, (current, total, info) => {
          onProgress?.('Coletando dados', index + 1, 4, `${ep.name}: ${info}`);
        });
        return { name: ep.name, data };
      })
    );
    
    // Processar resultados
    const payablesData = results[0].status === 'fulfilled' ? results[0].value.data : [];
    const ordersData = results[1].status === 'fulfilled' ? results[1].value.data : [];
    const directTransactionsData = results[2].status === 'fulfilled' ? results[2].value.data : [];
    
    console.log(`📊 [FASE 1] Coleta completa:`, {
      payables: payablesData.length,
      orders: ordersData.length,
      directTransactions: directTransactionsData.length
    });
    
    // FASE 2: Processamento de transações dos orders
    console.log('🚀 [FASE 2] Processando transações dos orders...');
    onProgress?.('Processando dados', 3, 4, 'Extraindo transações dos pedidos...');
    
    let orderTransactionsData: any[] = [];
    try {
      orderTransactionsData = ordersData.flatMap(order => {
        return order.charges?.map((charge: any) => ({
          ...charge,
          order_id: order.id,
          customer: order.customer,
          payment_method: charge.payment_method || 'unknown',
          source: 'order_charges'
        })) || [];
      });
      console.log(`📊 [FASE 2] Transações dos orders: ${orderTransactionsData.length}`);
    } catch (error) {
      console.warn('⚠️ [FASE 2] Erro ao processar orders:', error);
    }
    
    // FASE 3: Consolidação final
    console.log('🚀 [FASE 3] Consolidando dados...');
    onProgress?.('Consolidando', 4, 4, 'Finalizando processamento...');
    
    const allTransactionsData = [
      ...directTransactionsData.map(t => ({ ...t, source: 'direct_transactions' })),
      ...orderTransactionsData
    ];
    
    // Remover duplicatas por ID
    const uniqueTransactions = allTransactionsData.reduce((acc: any[], transaction: any) => {
      const exists = acc.find(t => t.id === transaction.id);
      if (!exists) {
        acc.push(transaction);
      }
      return acc;
    }, []);
    
    // FASE 4: Buscar saldo
    console.log('🚀 [FASE 4] Buscando saldo atualizado...');
    const balanceData = await fetchBalance(apiKey);
    
    const finalData = {
      payablesData,
      transactionsData: uniqueTransactions,
      ordersData,
      balanceData
    };
    
    // Armazenar resultado no cache master (30 minutos)
    dataCache.set(masterCacheKey, finalData, 30 * 60 * 1000);
    
    const finalStats = {
      payables: payablesData.length,
      orders: ordersData.length,
      directTransactions: directTransactionsData.length,
      orderTransactions: orderTransactionsData.length,
      uniqueTransactions: uniqueTransactions.length,
      balance: balanceData,
      totalOperations: payablesData.length + ordersData.length
    };
    
    console.log(`🎯 [MASTER] COLETA OTIMIZADA FINALIZADA:`, finalStats);
    onProgress?.('Concluído', 4, 4, `${finalStats.totalOperations} operações coletadas!`);

    return finalData;
    
  } catch (error: any) {
    console.error('💥 [MASTER] Erro crítico:', error);
    throw new Error(`Erro na coleta otimizada: ${error.message}`);
  }
};
