
/**
 * Hook para gerenciar configuração da API Pagar.me
 * VERSÃO COM ARMAZENAMENTO NO BANCO
 */

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConnectionStatus } from '../types';

export const useApiConfig = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(localStorage.getItem('pagarme_api_key') || '');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [errorDetails, setErrorDetails] = useState<string>('');

  // Carregar configuração do banco ao inicializar
  useEffect(() => {
    loadApiConfig();
  }, []);

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('❌ [AUTH] Erro ao renovar sessão:', error);
        return false;
      }
      console.log('✅ [AUTH] Sessão renovada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [AUTH] Erro crítico ao renovar sessão:', error);
      return false;
    }
  };

  const loadApiConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('pagarme_api_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ [CONFIG] Erro ao carregar configuração:', error);
        return;
      }

      if (data) {
        console.log('📋 [CONFIG] Configuração carregada do banco:', data);
        setApiKey(data.api_key);
        setConnectionStatus(data.connection_status as ConnectionStatus);
        setErrorDetails(data.error_details || '');
        
        // Também salvar no localStorage para compatibilidade
        localStorage.setItem('pagarme_api_key', data.api_key);
      }
    } catch (error: any) {
      console.error('❌ [CONFIG] Erro crítico ao carregar configuração:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey?.trim()) {
      toast({
        title: "Erro",
        description: "Configure uma chave API válida primeiro.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('💾 [CONFIG] Salvando chave API no banco...');
      
      const configData = {
        api_key: apiKey,
        connection_status: connectionStatus,
        error_details: errorDetails || null,
        last_sync_at: null,
        updated_at: new Date().toISOString()
      };

      let { error } = await supabase
        .from('pagarme_api_config')
        .upsert(configData, {
          onConflict: 'api_key',
          ignoreDuplicates: false
        });

      // Se o erro for relacionado a JWT expirado, tenta renovar a sessão
      if (error && (error.message.includes('JWT') || error.message.includes('expired'))) {
        console.log('🔄 [AUTH] Token expirado, tentando renovar sessão...');
        
        const sessionRefreshed = await refreshSession();
        
        if (sessionRefreshed) {
          // Tenta novamente após renovar a sessão
          const result = await supabase
            .from('pagarme_api_config')
            .upsert(configData, {
              onConflict: 'api_key',
              ignoreDuplicates: false
            });
          
          error = result.error;
        }
      }

      if (error) {
        console.error('❌ [CONFIG] Erro ao salvar configuração:', error);
        
        // Tratamento específico para diferentes tipos de erro
        let errorMessage = 'Erro desconhecido';
        
        if (error.message.includes('JWT') || error.message.includes('expired')) {
          errorMessage = 'Sessão expirada. Recarregue a página e tente novamente.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Sem permissão para salvar configuração.';
        } else {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      // Salvar também no localStorage
      localStorage.setItem('pagarme_api_key', apiKey);

      console.log('✅ [CONFIG] Configuração salva com sucesso!');
      
      toast({
        title: "Configuração salva",
        description: "Chave API salva com sucesso!",
      });

    } catch (error: any) {
      console.error('❌ [CONFIG] Erro crítico:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    // Estado
    apiKey,
    connectionStatus,
    errorDetails,
    
    // Ações
    setApiKey,
    saveApiKey,
    setConnectionStatus,
    setErrorDetails
  };
};
