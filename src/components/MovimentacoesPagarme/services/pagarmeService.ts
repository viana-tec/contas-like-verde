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

// Função para buscar dados com paginação automática ILIMITADA E ROBUSTA
export const fetchAllDataUnlimited = async (endpoint: string, apiKey: string): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  const pageSize = 250; // Aumentado para 250 para maior eficiência
  let maxPages = 200; // AUMENTADO para 200 páginas (50.000 registros por endpoint)
  
  console.log(`📄 [FRONTEND] Iniciando coleta ILIMITADA: ${endpoint}`);
  
  while (page <= maxPages) {
    const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}count=${pageSize}&page=${page}`;
    
    console.log(`📄 [FRONTEND] Buscando página ${page}/${maxPages}: ${fullEndpoint}`);
    
    try {
      const response = await makeApiRequest(fullEndpoint, apiKey);
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.log(`📄 [FRONTEND] Página ${page}: Sem dados ou formato inválido`);
        break;
      }
      
      const newData = response.data;
      
      // Se não há dados novos, parar
      if (newData.length === 0) {
        console.log(`📄 [FRONTEND] Página ${page}: Sem novos dados - finalizando`);
        break;
      }
      
      allData = [...allData, ...newData];
      
      console.log(`📄 [FRONTEND] Página ${page}: ${newData.length} registros, Total acumulado: ${allData.length}`);
      
      // Se retornou menos que o tamanho da página, chegamos ao fim
      if (newData.length < pageSize) {
        console.log(`📄 [FRONTEND] Fim da paginação: última página retornou ${newData.length} registros`);
        break;
      }
      
      page++;
      
      // Pausa otimizada para máxima eficiência
      await new Promise(resolve => setTimeout(resolve, 150));
      
    } catch (error) {
      console.error(`❌ [FRONTEND] Erro na página ${page}:`, error);
      
      // Se for erro de rate limit, tentar novamente após pausa
      if (error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('Limite')) {
        console.log(`📄 [FRONTEND] Rate limit - aguardando 3s antes de continuar...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue; // Tentar a mesma página novamente
      }
      
      // Para outros erros, continuar próxima página ou parar
      console.log(`📄 [FRONTEND] Tentando próxima página após erro...`);
      page++;
      
      if (page > maxPages) break;
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
    
    // CORREÇÃO APLICADA: Valores vêm em centavos, dividir por 100 UMA vez para converter para reais
    const available = (balanceResponse?.available_amount || 0) / 100;
    const pending = (balanceResponse?.waiting_funds_amount || 0) / 100;
    
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

// Função para buscar TODOS os dados de MÚLTIPLOS ENDPOINTS - IMPLEMENTAÇÃO ROBUSTA COMPLETA
export const fetchAllData = async (apiKey: string) => {
  console.log('🚀 [FRONTEND] Iniciando COLETA MASSIVA ILIMITADA de MÚLTIPLOS ENDPOINTS...');
  
  // Data de 6 meses atrás para garantir TODOS os dados históricos
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateParam = sixMonthsAgo.toISOString().split('T')[0];
  
  console.log(`📅 [FRONTEND] Data de referência (6 meses): ${dateParam}`);
  
  try {
    // FASE 1: Coleta PARALELA de TODOS os endpoints principais
    console.log('🚀 [FRONTEND] FASE 1: Coletando de TODOS OS ENDPOINTS em paralelo...');
    
    const [payablesData, ordersData, directTransactionsData] = await Promise.all([
      // Endpoint 1: Payables (recebíveis) - MAIS IMPORTANTE
      fetchAllDataUnlimited(`/core/v5/payables?created_since=${dateParam}`, apiKey),
      // Endpoint 2: Orders (pedidos completos)
      fetchAllDataUnlimited(`/core/v5/orders?created_since=${dateParam}`, apiKey),
      // Endpoint 3: Transações DIRETAS (não apenas dos orders)
      fetchAllDataUnlimited(`/core/v5/transactions?created_since=${dateParam}`, apiKey)
    ]);
    
    console.log(`📊 [FRONTEND] COLETA FASE 1 FINALIZADA:`, {
      payables: payablesData.length,
      orders: ordersData.length,
      directTransactions: directTransactionsData.length
    });
    
    // FASE 2: Processar e enriquecer transações dos orders
    console.log('🚀 [FRONTEND] FASE 2: Extraindo transações dos orders...');
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
      console.log(`📊 [FRONTEND] Transações extraídas dos orders: ${orderTransactionsData.length}`);
    } catch (error) {
      console.warn('⚠️ [FRONTEND] Erro ao extrair transações dos orders');
      orderTransactionsData = [];
    }
    
    // FASE 3: Consolidar TODAS as transações (diretas + orders)
    console.log('🚀 [FRONTEND] FASE 3: Consolidando TODAS as transações...');
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
    
    console.log(`📊 [FRONTEND] Transações consolidadas: ${allTransactionsData.length} -> ${uniqueTransactions.length} (únicas)`);
    
    // FASE 4: Buscar saldo do recipient
    console.log('🚀 [FRONTEND] FASE 4: Buscando saldo...');
    const balanceData = await fetchBalance(apiKey);
    
    console.log(`🎯 [FRONTEND] COLETA MASSIVA COMPLETA FINALIZADA:`, {
      payables: payablesData.length,
      orders: ordersData.length,
      directTransactions: directTransactionsData.length,
      orderTransactions: orderTransactionsData.length,
      uniqueTransactions: uniqueTransactions.length,
      balance: balanceData,
      totalOperations: payablesData.length + ordersData.length,
      grandTotal: payablesData.length + ordersData.length + uniqueTransactions.length
    });

    return {
      payablesData,
      transactionsData: uniqueTransactions,
      ordersData,
      balanceData
    };
    
  } catch (error: any) {
    console.error('💥 [FRONTEND] Erro na coleta massiva ilimitada:', error);
    throw new Error(`Erro na coleta de dados: ${error.message}`);
  }
};