
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

  const loadApiConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('pagarme_api_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
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

      const { error } = await supabase
        .from('pagarme_api_config')
        .upsert(configData, {
          onConflict: 'api_key',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ [CONFIG] Erro ao salvar configuração:', error);
        throw new Error(`Erro ao salvar configuração: ${error.message}`);
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
