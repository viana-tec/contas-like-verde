
/**
 * Hook para usar o coletor de dados da Pagar.me
 * CORRIGIDO: Tratamento de erros melhorado
 */

import { useState, useCallback } from 'react';
import { pagarmeCollector } from '../services/pagarmeCollector';

interface CollectionState {
  loading: boolean;
  progress: {
    currentPage: number;
    totalCollected: number;
    info: string;
  } | null;
  result: {
    data: any[];
    totalPages: number;
    totalResults: number;
    endpoint: string;
    success: boolean;
    error?: string;
  } | null;
}

export const usePagarmeCollector = () => {
  const [state, setState] = useState<CollectionState>({
    loading: false,
    progress: null,
    result: null
  });

  const coletarDados = useCallback(async (
    endpoint: 'orders' | 'payments' | 'transactions',
    token: string,
    options?: {
      pageSize?: number;
      maxPages?: number;
    }
  ) => {
    if (!token.trim()) {
      throw new Error('Token é obrigatório');
    }

    setState(prev => ({
      ...prev,
      loading: true,
      progress: null,
      result: null
    }));

    try {
      console.log(`🚀 [HOOK] Iniciando coleta para ${endpoint}`);
      
      const result = await pagarmeCollector.coletarTodasMovimentacoes({
        endpoint,
        token: token.trim(),
        pageSize: options?.pageSize || 100,
        maxPages: options?.maxPages || 1000,
        onProgress: (page, totalCollected, info) => {
          setState(prev => ({
            ...prev,
            progress: {
              currentPage: page,
              totalCollected,
              info
            }
          }));
        }
      });

      setState(prev => ({
        ...prev,
        loading: false,
        result
      }));

      return result;

    } catch (error: any) {
      console.error(`❌ [HOOK] Erro na coleta:`, error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        result: {
          data: [],
          totalPages: 0,
          totalResults: 0,
          endpoint,
          success: false,
          error: error.message
        }
      }));

      throw error;
    }
  }, []);

  const testarConexao = useCallback(async (token: string) => {
    if (!token.trim()) {
      throw new Error('Token é obrigatório');
    }

    return await pagarmeCollector.testarConexao(token.trim());
  }, []);

  const limparResultados = useCallback(() => {
    setState({
      loading: false,
      progress: null,
      result: null
    });
  }, []);

  return {
    loading: state.loading,
    progress: state.progress,
    result: state.result,
    coletarDados,
    testarConexao,
    limparResultados
  };
};
