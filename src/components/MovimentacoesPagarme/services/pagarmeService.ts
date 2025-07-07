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

// Função para buscar dados com paginação automática COMPLETA E ROBUSTA
export const fetchAllDataUnlimited = async (endpoint: string, apiKey: string): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  const pageSize = 100; // Reduzi para 100 para garantir mais estabilidade
  let maxPages = 50; // Limite máximo de páginas para segurança
  
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
      
      // Pausa maior para estabilidade
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`❌ [FRONTEND] Erro na página ${page}:`, error);
      
      // Se for erro de rate limit, tentar novamente após pausa
      if (error.message?.includes('429') || error.message?.includes('rate')) {
        console.log(`📄 [FRONTEND] Rate limit - aguardando 2s antes de continuar...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
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
    
    // CORREÇÃO: NÃO dividir por 100 - valores já vêm em centavos mas devem ser exibidos como reais
    const available = (balanceResponse?.available_amount || 0) / 100; // Já em centavos, converter para reais
    const pending = (balanceResponse?.waiting_funds_amount || 0) / 100; // Já em centavos, converter para reais
    
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

// Função para buscar todos os dados necessários COM COLETA MASSIVA
export const fetchAllData = async (apiKey: string) => {
  console.log('🔄 [FRONTEND] Iniciando coleta MASSIVA COMPLETA...');
  
  // Data de 6 meses atrás para garantir TODOS os dados
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dateParam = sixMonthsAgo.toISOString().split('T')[0];
  
  console.log(`📅 [FRONTEND] Data de referência (6 meses): ${dateParam}`);
  
  try {
    // Buscar dados em paralelo para acelerar
    console.log('🚀 [FRONTEND] Buscando TODOS os payables e orders...');
    
    const [payablesData, ordersData] = await Promise.all([
      fetchAllDataUnlimited(`/core/v5/payables?created_since=${dateParam}`, apiKey),
      fetchAllDataUnlimited(`/core/v5/orders?created_since=${dateParam}`, apiKey)
    ]);
    
    console.log('🚀 [FRONTEND] Processando transações dos orders...');
    let transactionsData: any[] = [];
    try {
      // Extrair transações dos orders (que já temos)
      transactionsData = ordersData.flatMap(order => {
        return order.charges?.map((charge: any) => ({
          ...charge,
          order_id: order.id,
          customer: order.customer,
          payment_method: charge.payment_method || 'unknown'
        })) || [];
      });
      console.log(`📊 [FRONTEND] Transações extraídas dos orders: ${transactionsData.length}`);
    } catch (error) {
      console.warn('⚠️ [FRONTEND] Erro ao extrair transações, usando array vazio');
      transactionsData = [];
    }
    
    console.log('🚀 [FRONTEND] Buscando saldo...');
    const balanceData = await fetchBalance(apiKey);
    
    console.log(`🎯 [FRONTEND] COLETA MASSIVA FINALIZADA:`, {
      payables: payablesData.length,
      transactions: transactionsData.length,
      orders: ordersData.length,
      balance: balanceData,
      totalOperations: payablesData.length + ordersData.length
    });

    return {
      payablesData,
      transactionsData,
      ordersData,
      balanceData
    };
    
  } catch (error: any) {
    console.error('💥 [FRONTEND] Erro na coleta massiva:', error);
    throw new Error(`Erro na coleta de dados: ${error.message}`);
  }
};