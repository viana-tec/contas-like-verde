
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
  let maxPages = 10000; // Aumentar ainda mais o limite para garantir coleta completa
  let consecutiveEmptyPages = 0;
  const maxConsecutiveEmpty = 5;
  
  console.log(`📄 [COLETA] Iniciando coleta MASSIVA v5: ${endpoint}`);
  
  while (page <= maxPages && consecutiveEmptyPages < maxConsecutiveEmpty) {
    // API v5 usa 'size' e 'page' (não 'count')
    const fullEndpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}size=${pageSize}&page=${page}`;
    
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
      await new Promise(resolve => setTimeout(resolve, 50));
      
    } catch (error: any) {
      console.error(`❌ [COLETA] Erro na página ${page}:`, error);
      
      if (error.message?.includes('429') || error.message?.includes('rate') || error.message?.includes('Limite')) {
        console.log(`📄 [RATE_LIMIT] Aguardando 3s...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
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

// Função MASSIVA para buscar TODAS as charges (ch_) com filtros de data corretos
export const fetchAllData = async (
  apiKey: string, 
  onProgress?: (stage: string, current: number, total: number, info: string) => void
) => {
  console.log('🚀 [MASTER] Iniciando COLETA MASSIVA DE CHARGES (ch_) com filtros de data...');
  
  // Período estendido de 36 meses para capturar TODOS os dados históricos
  const thirtyFiveMonthsAgo = new Date();
  thirtyFiveMonthsAgo.setMonth(thirtyFiveMonthsAgo.getMonth() - 36);
  const createdSince = thirtyFiveMonthsAgo.toISOString().split('T')[0];
  
  // Data atual como limite
  const today = new Date();
  const createdUntil = today.toISOString().split('T')[0];
  
  console.log(`📅 [MASTER] Período: ${createdSince} até ${createdUntil} (36 meses)`);
  
  try {
    // FASE 1: Coleta MASSIVA focada SOMENTE em charges com filtros de data
    console.log('🚀 [FASE 1] Iniciando coleta massiva de charges com filtros de data...');
    onProgress?.('Coletando charges', 1, 2, 'Iniciando coleta de todas as charges...');
    
    // Usar filtros corretos de data para payables/charges
    const chargesEndpoint = `/core/v5/charges?created_since=${createdSince}&created_until=${createdUntil}`;
    
    console.log(`📡 [ENDPOINT] ${chargesEndpoint}`);
    
    const chargesData = await fetchAllDataUnlimited(chargesEndpoint, apiKey, (current, total, info) => {
      onProgress?.('Coletando charges', 1, 2, `Charges: ${info}`);
    });
    
    console.log(`📊 [FASE 1] Coleta de charges completa: ${chargesData.length} charges`);
    
    // FASE 2: Filtrar somente charges que começam com 'ch_'
    console.log('🚀 [FASE 2] Filtrando charges válidas (ch_)...');
    onProgress?.('Processando dados', 2, 2, 'Filtrando charges válidas...');
    
    const validCharges = chargesData.filter(charge => 
      charge.id && charge.id.startsWith('ch_')
    );
    
    const finalStats = {
      totalCharges: chargesData.length,
      validCharges: validCharges.length,
      filtered: chargesData.length - validCharges.length
    };
    
    console.log(`🎯 [MASTER] COLETA FINALIZADA:`, finalStats);
    console.log(`📋 [SAMPLE] Amostra de charge:`, validCharges[0]);
    
    onProgress?.('Concluído', 2, 2, `${finalStats.validCharges} charges válidas coletadas!`);

    return {
      payablesData: validCharges, // Somente charges válidas
      transactionsData: [], // Removido transações
      ordersData: [] // Removido orders
    };
    
  } catch (error: any) {
    console.error('💥 [MASTER] Erro crítico:', error);
    throw new Error(`Erro na coleta massiva: ${error.message}`);
  }
};
