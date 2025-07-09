
/**
 * Serviço para coleta completa de dados da API v5 Pagar.me
 * CORRIGIDO: Usa edge function pagarme-proxy para contornar CORS
 */

import { supabase } from '@/integrations/supabase/client';

interface CollectionConfig {
  endpoint: 'orders' | 'payments' | 'transactions';
  token: string;
  pageSize?: number;
  maxPages?: number;
  onProgress?: (page: number, totalCollected: number, info: string) => void;
}

interface CollectionResult {
  data: any[];
  totalPages: number;
  totalResults: number;
  endpoint: string;
  success: boolean;
  error?: string;
}

export class PagarmeCollector {
  /**
   * Busca todos os dados com paginação automática usando edge function
   */
  async coletarTodasMovimentacoes(config: CollectionConfig): Promise<CollectionResult> {
    const {
      endpoint,
      token,
      pageSize = 100,
      maxPages = 1000,
      onProgress
    } = config;

    console.log(`🚀 [COLLECTOR] Iniciando coleta completa de ${endpoint}`);
    
    let pagina = 1;
    const tamanhoPagina = pageSize;
    let continuarLoop = true;
    const resultadoFinal: any[] = [];
    let totalPaginas = 0;
    
    try {
      while (continuarLoop && pagina <= maxPages) {
        console.log(`📄 [COLLECTOR] Página ${pagina} - Buscando ${endpoint}...`);
        
        onProgress?.(pagina, resultadoFinal.length, `Coletando página ${pagina}...`);
        
        const dadosPagina = await this.buscarPagina(endpoint, token, pagina, tamanhoPagina);
        
        if (!dadosPagina.success) {
          throw new Error(dadosPagina.error || 'Erro na requisição');
        }
        
        const resultados = dadosPagina.data || [];
        
        console.log(`📊 [COLLECTOR] Página ${pagina}: ${resultados.length} resultados`);
        
        resultadoFinal.push(...resultados);
        
        if (resultados.length < tamanhoPagina) {
          console.log(`✅ [COLLECTOR] Última página detectada (${resultados.length} < ${tamanhoPagina})`);
          continuarLoop = false;
        } else {
          pagina++;
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      totalPaginas = pagina;
      
      console.log(`🎯 [COLLECTOR] Coleta finalizada: ${resultadoFinal.length} registros em ${totalPaginas} páginas`);
      
      return {
        data: resultadoFinal,
        totalPages: totalPaginas,
        totalResults: resultadoFinal.length,
        endpoint,
        success: true
      };
      
    } catch (error: any) {
      console.error(`❌ [COLLECTOR] Erro na coleta:`, error);
      
      return {
        data: resultadoFinal,
        totalPages: pagina - 1,
        totalResults: resultadoFinal.length,
        endpoint,
        success: false,
        error: error.message || 'Erro desconhecido'
      };
    }
  }
  
  /**
   * Busca uma página específica usando a edge function pagarme-proxy
   */
  private async buscarPagina(
    endpoint: string, 
    token: string, 
    page: number, 
    size: number
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    
    try {
      const apiEndpoint = `/core/v5/${endpoint}?page=${page}&size=${size}`;
      
      console.log(`🌐 [REQUEST] Chamando edge function para: ${apiEndpoint}`);
      
      const { data, error } = await supabase.functions.invoke('pagarme-proxy', {
        body: {
          endpoint: apiEndpoint,
          apiKey: token
        }
      });
      
      if (error) {
        console.error(`❌ [REQUEST] Erro da edge function:`, error);
        return {
          success: false,
          error: error.message || 'Erro na edge function'
        };
      }
      
      if (data?.error) {
        console.error(`❌ [REQUEST] Erro da API:`, data.error);
        return {
          success: false,
          error: data.error
        };
      }
      
      const resultados = data?.data || [];
      
      console.log(`✅ [REQUEST] Página ${page} - ${resultados.length} resultados`);
      
      return {
        success: true,
        data: resultados
      };
      
    } catch (error: any) {
      console.error(`❌ [REQUEST] Erro na requisição:`, error);
      
      return {
        success: false,
        error: error.message || 'Erro de conexão'
      };
    }
  }
  
  /**
   * Método auxiliar para testar conexão
   */
  async testarConexao(token: string): Promise<{ success: boolean; error?: string }> {
    try {
      const resultado = await this.buscarPagina('orders', token, 1, 10);
      
      if (resultado.success) {
        console.log('✅ [TEST] Conexão com API v5 Pagar.me estabelecida');
        return { success: true };
      } else {
        return { success: false, error: resultado.error };
      }
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const pagarmeCollector = new PagarmeCollector();
