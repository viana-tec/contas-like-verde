
/**
 * Data collection service for massively collecting data from Pagar.me API
 * Handles pagination, progress tracking, and parallel collection
 */

import { makeApiRequest } from './apiClient';

// Função para buscar dados com paginação MASSIVA E OTIMIZADA
export const fetchAllDataUnlimited = async (
  endpoint: string, 
  apiKey: string,
  onProgress?: (current: number, total: number, info: string) => void
): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  let pageSize = 100; // API v5 usa 'size' e max 100
  let maxPages = 2000; // Aumentar limite para coleta completa de transações
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

// Função MASSIVA para buscar TODOS os dados de MÚLTIPLOS endpoints - VERSÃO DEFINITIVA
export const fetchAllData = async (
  apiKey: string, 
  onProgress?: (stage: string, current: number, total: number, info: string) => void
) => {
  console.log('🚀 [MASTER] Iniciando COLETA MASSIVA ILIMITADA DEFINITIVA...');
  
  // Período estendido de 12 meses para capturar TODOS os dados históricos
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const dateParam = twelveMonthsAgo.toISOString().split('T')[0];
  
  console.log(`📅 [MASTER] Período: ${dateParam} até hoje (12 meses)`);
  
  try {
    // FASE 1: Coleta PARALELA OTIMIZADA focada em charges e transactions
    console.log('🚀 [FASE 1] Iniciando coleta paralela otimizada (charges + transactions)...');
    onProgress?.('Coletando dados', 1, 3, 'Iniciando coleta de charges e transactions...');
    
    const endpoints = [
      { name: 'charges', url: `/core/v5/charges?created_since=${dateParam}` },
      { name: 'transactions', url: `/core/v5/transactions?created_since=${dateParam}` }
    ];
    
    const results = await Promise.allSettled(
      endpoints.map(async (ep, index) => {
        onProgress?.('Coletando dados', index + 1, 3, `Coletando ${ep.name}...`);
        const data = await fetchAllDataUnlimited(ep.url, apiKey, (current, total, info) => {
          onProgress?.('Coletando dados', index + 1, 3, `${ep.name}: ${info}`);
        });
        return { name: ep.name, data };
      })
    );
    
    // Processar resultados
    const chargesData = results[0].status === 'fulfilled' ? results[0].value.data : [];
    const transactionsData = results[1].status === 'fulfilled' ? results[1].value.data : [];
    
    console.log(`📊 [FASE 1] Coleta completa:`, {
      charges: chargesData.length,
      transactions: transactionsData.length
    });
    
    // FASE 2: Processamento de charges para transações
    console.log('🚀 [FASE 2] Processando transações dos charges...');
    onProgress?.('Processando dados', 2, 3, 'Extraindo transações dos charges...');
    
    let chargeTransactionsData: any[] = [];
    try {
      chargeTransactionsData = chargesData.map(charge => ({
        ...charge,
        charge_id: charge.id,
        payment_method: charge.payment_method || 'unknown',
        source: 'charge_transactions'
      }));
      console.log(`📊 [FASE 2] Transações dos charges: ${chargeTransactionsData.length}`);
    } catch (error) {
      console.warn('⚠️ [FASE 2] Erro ao processar charges:', error);
    }
    
    // FASE 3: Consolidação final
    console.log('🚀 [FASE 3] Consolidando dados...');
    onProgress?.('Consolidando', 3, 3, 'Finalizando processamento...');
    
    const allTransactionsData = [
      ...transactionsData.map(t => ({ ...t, source: 'direct_transactions' })),
      ...chargesData.map(c => ({ ...c, source: 'direct_charges' })),
      ...chargeTransactionsData
    ];
    
    // Remover duplicatas por ID
    const uniqueTransactions = allTransactionsData.reduce((acc: any[], transaction: any) => {
      const exists = acc.find(t => t.id === transaction.id);
      if (!exists) {
        acc.push(transaction);
      }
      return acc;
    }, []);
    
    const finalStats = {
      charges: chargesData.length,
      directTransactions: transactionsData.length,
      chargeTransactions: chargeTransactionsData.length,
      uniqueTransactions: uniqueTransactions.length,
      totalOperations: chargesData.length + transactionsData.length
    };
    
    console.log(`🎯 [MASTER] COLETA DEFINITIVA FINALIZADA:`, finalStats);
    onProgress?.('Concluído', 3, 3, `${finalStats.totalOperations} operações coletadas!`);

    return {
      payablesData: chargesData, // Na v5, charges substituem payables
      transactionsData: uniqueTransactions,
      ordersData: [] // Removido orders da coleta
    };
    
  } catch (error: any) {
    console.error('💥 [MASTER] Erro crítico:', error);
    throw new Error(`Erro na coleta massiva: ${error.message}`);
  }
};
