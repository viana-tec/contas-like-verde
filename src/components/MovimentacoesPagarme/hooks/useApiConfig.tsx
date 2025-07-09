
/**
 * Hook para gerenciar configurações da API Pagar.me no banco de dados
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ConnectionStatus as ConnectionStatusType } from '../types';

export const useApiConfig = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [errorDetails, setErrorDetails] = useState('');

  // Carregar configuração do banco ao inicializar
  useEffect(() => {
    loadApiConfig();
  }, []);

  const loadApiConfig = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pagarme_api_config')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar configuração:', error);
        return;
      }

      if (data) {
        setApiKey(data.api_key);
        setConnectionStatus(data.connection_status as ConnectionStatusType);
        setErrorDetails(data.error_details || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiConfig = async (newApiKey: string, status?: ConnectionStatusType, error?: string) => {
    try {
      // Primeiro, verificar se já existe uma configuração
      const { data: existing } = await supabase
        .from('pagarme_api_config')
        .select('id')
        .limit(1)
        .maybeSingle();

      const configData = {
        api_key: newApiKey,
        connection_status: status || 'idle',
        error_details: error || null,
        last_sync_at: status === 'connected' ? new Date().toISOString() : null
      };

      if (existing) {
        // Atualizar configuração existente
        const { error: updateError } = await supabase
          .from('pagarme_api_config')
          .update(configData)
          .eq('id', existing.id);

        if (updateError) {
          console.error('Erro ao atualizar configuração:', updateError);
          return false;
        }
      } else {
        // Criar nova configuração
        const { error: insertError } = await supabase
          .from('pagarme_api_config')
          .insert([configData]);

        if (insertError) {
          console.error('Erro ao salvar configuração:', insertError);
          return false;
        }
      }

      // Atualizar estado local
      setApiKey(newApiKey);
      setConnectionStatus(status || 'idle');
      setErrorDetails(error || '');

      return true;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      return false;
    }
  };

  const updateConnectionStatus = async (status: ConnectionStatusType, error?: string) => {
    const success = await saveApiConfig(apiKey, status, error);
    if (success) {
      setConnectionStatus(status);
      setErrorDetails(error || '');
    }
  };

  return {
    apiKey,
    connectionStatus,
    errorDetails,
    isLoading,
    setApiKey,
    saveApiConfig,
    updateConnectionStatus,
    loadApiConfig
  };
};
