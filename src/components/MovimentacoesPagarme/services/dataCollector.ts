
/**
 * Data collection service for massively collecting data from Pagar.me API
 * Handles pagination, progress tracking, and parallel collection
 * CORRIGIDO PARA USAR ENDPOINT CORRETO DE PAYABLES
 */

import { makeApiRequest } from './apiClient';

// Função para buscar dados com paginação MASSIVA E OTIMIZADA - ENDPOINT CORRETO
export const fetchAllDataUnlimited = async (
  endpoint: string, 
  apiKey: string,
  onProgress?: (current: number, total: number, info: string) => void
): Promise<any[]> => {
  let allData: any[] = [];
  let page = 1;
  let pageSize = 100; // API v5 usa 'count' e max 100
  let maxPages = 10000; // Aumentar ainda mais o limite para garantir coleta completa
  let consecutiveEmptyPages = 0;
  const maxConsecutiveEmpty = 5;
  
  console.log(`📄 [COLETA] Iniciando coleta MASSIVA v5: ${endpoint}`);
  
  while (page <= maxPages && consecutiveEmptyPages < maxConsecutiveEmpty) {
    // API v5 de payables usa 'count' e 'page'
    const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}count=${pageSize}&page=${page}`;
    
    onProgress?.(page, maxPages, `Coletando página ${page}... (${allData.length} registros)`);
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

// Função MASSIVA para buscar TODOS os payables (recebíveis) - ENDPOINT CORRETO
export const fetchAllData = async (
  apiKey: string, 
  onProgress?: (stage: string, current: number, total: number, info: string) => void
) => {
  console.log('🚀 [MASTER] Iniciando COLETA MASSIVA DE PAYABLES (recebíveis) - ENDPOINT CORRETO...');
  
  // Período estendido de 36 meses para capturar TODOS os dados históricos
  const thirtyFiveMonthsAgo = new Date();
  thirtyFiveMonthsAgo.setMonth(thirtyFiveMonthsAgo.getMonth() - 36);
  const createdSince = thirtyFiveMonthsAgo.toISOString().split('T')[0];
  
  // Data atual como limite
  const today = new Date();
  const createdUntil = today.toISOString().split('T')[0];
  
  console.log(`📅 [MASTER] Período: ${createdSince} até ${createdUntil} (36 meses)`);
  
  try {
    // FASE 1: Coleta MASSIVA usando ENDPOINT CORRETO de payables
    console.log('🚀 [FASE 1] Iniciando coleta massiva de payables (recebíveis)...');
    onProgress?.('Coletando payables', 1, 2, 'Iniciando coleta de todos os recebíveis...');
    
    // USAR ENDPOINT CORRETO DE PAYABLES com filtros de data
    const payablesEndpoint = `/core/v5/payables?created_since=${createdSince}&created_until=${createdUntil}`;
    
    console.log(`📡 [ENDPOINT CORRETO] ${payablesEndpoint}`);
    
    const payablesData = await fetchAllDataUnlimited(payablesEndpoint, apiKey, (current, total, info) => {
      onProgress?.('Coletando payables', 1, 2, `Payables: ${info}`);
    });
    
    console.log(`📊 [FASE 1] Coleta de payables completa: ${payablesData.length} payables`);
    
    // FASE 2: Processar dados recebidos
    console.log('🚀 [FASE 2] Processando payables recebidos...');
    onProgress?.('Processando dados', 2, 2, 'Processando recebíveis...');
    
    const finalStats = {
      totalPayables: payablesData.length,
      filteredPayables: payablesData.length
    };
    
    console.log(`🎯 [MASTER] COLETA FINALIZADA:`, finalStats);
    console.log(`📋 [SAMPLE] Amostra de payable:`, payablesData[0]);
    
    onProgress?.('Concluído', 2, 2, `${finalStats.totalPayables} recebíveis coletados!`);

    return {
      payablesData: payablesData, // Todos os payables
      transactionsData: [], // Removido transações
      ordersData: [] // Removido orders
    };
    
  } catch (error: any) {
    console.error('💥 [MASTER] Erro crítico:', error);
    throw new Error(`Erro na coleta massiva: ${error.message}`);
  }
};
