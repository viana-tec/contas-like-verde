
/**
 * Serviço para coleta completa de dados da API v5 Pagar.me
 * Implementa paginação automática para buscar todos os dados
 */

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
  private baseUrl = 'https://api.pagar.me/core/v5';
  
  /**
   * Busca todos os dados com paginação automática
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
    
    // Variáveis de controle do fluxo
    let pagina = 1;
    const tamanhoPagina = pageSize;
    let continuarLoop = true;
    const resultadoFinal: any[] = [];
    let totalPaginas = 0;
    
    try {
      while (continuarLoop && pagina <= maxPages) {
        console.log(`📄 [COLLECTOR] Página ${pagina} - Buscando ${endpoint}...`);
        
        // Callback de progresso
        onProgress?.(pagina, resultadoFinal.length, `Coletando página ${pagina}...`);
        
        // Fazer requisição para a página atual
        const dadosPagina = await this.buscarPagina(endpoint, token, pagina, tamanhoPagina);
        
        if (!dadosPagina.success) {
          throw new Error(dadosPagina.error || 'Erro na requisição');
        }
        
        const resultados = dadosPagina.data || [];
        
        console.log(`📊 [COLLECTOR] Página ${pagina}: ${resultados.length} resultados`);
        
        // Adicionar resultados à lista final
        resultadoFinal.push(...resultados);
        
        // Verificar se deve continuar
        if (resultados.length < tamanhoPagina) {
          console.log(`✅ [COLLECTOR] Última página detectada (${resultados.length} < ${tamanhoPagina})`);
          continuarLoop = false;
        } else {
          pagina++;
          
          // Pequena pausa entre requisições para evitar rate limit
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
   * Busca uma página específica da API
   */
  private async buscarPagina(
    endpoint: string, 
    token: string, 
    page: number, 
    size: number
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    
    try {
      const url = `${this.baseUrl}/${endpoint}?page=${page}&size=${size}`;
      
      console.log(`🌐 [REQUEST] ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ [REQUEST] Erro HTTP ${response.status}: ${errorText}`);
        
        let errorMessage = `Erro ${response.status}`;
        
        switch (response.status) {
          case 401:
            errorMessage = 'Token inválido ou expirado';
            break;
          case 403:
            errorMessage = 'Acesso negado - verifique as permissões do token';
            break;
          case 404:
            errorMessage = 'Endpoint não encontrado';
            break;
          case 429:
            errorMessage = 'Muitas requisições - aguarde um momento';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor Pagar.me';
            break;
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
      
      const data = await response.json();
      
      console.log(`✅ [REQUEST] Página ${page} - ${data.data?.length || 0} resultados`);
      
      return {
        success: true,
        data: data.data || []
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

// Instância singleton para uso na aplicação
export const pagarmeCollector = new PagarmeCollector();
