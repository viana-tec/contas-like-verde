
/**
 * Hook para sincronização inteligente com a API Pagar.me
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SyncProgress {
  current: number;
  total: number;
  operation?: string;
  status: 'idle' | 'running' | 'completed' | 'error';
}

interface SyncResult {
  operation_id: string;
  old_status: string;
  new_status: string;
  success: boolean;
  error?: string;
}

export const useSmartStatusSync = () => {
  const [progress, setProgress] = useState<SyncProgress>({ current: 0, total: 0, status: 'idle' });
  const [results, setResults] = useState<SyncResult[]>([]);
  const { toast } = useToast();

  const syncWithAPI = async (operationIds?: string[]) => {
    const apiKey = localStorage.getItem('pagarme_api_key');
    if (!apiKey) {
      toast({
        title: "Erro",
        description: "Chave API não configurada",
        variant: "destructive"
      });
      return;
    }

    setProgress({ current: 0, total: 0, status: 'running' });
    setResults([]);

    try {
      // Buscar operações para sincronizar
      let query = supabase
        .from('pagarme_operations')
        .select('external_id, status, payment_method, created_at')
        .eq('payment_method', 'credit_card');

      if (operationIds && operationIds.length > 0) {
        query = query.in('external_id', operationIds);
      } else {
        // Se não especificado, focar nas problemáticas
        query = query
          .eq('status', 'waiting_funds')
          .gte('created_at', '2025-07-08');
      }

      const { data: operations, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      if (!operations || operations.length === 0) {
        toast({
          title: "Nenhuma operação encontrada",
          description: "Não há operações para sincronizar"
        });
        setProgress(prev => ({ ...prev, status: 'completed' }));
        return;
      }

      setProgress({ current: 0, total: operations.length, status: 'running' });
      console.log(`🔄 [SMART_SYNC] Iniciando sincronização de ${operations.length} operações`);

      const syncResults: SyncResult[] = [];
      const batchSize = 5; // Processar em lotes pequenos para evitar rate limit

      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize);
        setProgress(prev => ({ 
          ...prev, 
          current: i, 
          operation: `Lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(operations.length/batchSize)}`
        }));

        const batchPromises = batch.map(async (operation) => {
          try {
            // Consultar status real na API
            const response = await fetch('/api/pagarme-proxy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endpoint: `/core/v5/payables/${operation.external_id}`,
                apiKey: apiKey
              })
            });

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

            const apiData = await response.json();
            const realStatus = apiData.status;

            if (!realStatus) {
              throw new Error('Status não retornado pela API');
            }

            const result: SyncResult = {
              operation_id: operation.external_id,
              old_status: operation.status,
              new_status: realStatus,
              success: true
            };

            // Se o status for diferente, atualizar no banco
            if (realStatus !== operation.status) {
              const { error: updateError } = await supabase
                .from('pagarme_operations')
                .update({ 
                  status: realStatus,
                  updated_at: new Date().toISOString(),
                  synced_at: new Date().toISOString()
                })
                .eq('external_id', operation.external_id);

              if (updateError) {
                result.success = false;
                result.error = updateError.message;
              }
            }

            return result;

          } catch (error: any) {
            return {
              operation_id: operation.external_id,
              old_status: operation.status,
              new_status: operation.status,
              success: false,
              error: error.message
            };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            syncResults.push(result.value);
          }
        });

        // Pausa entre lotes para evitar rate limit
        if (i + batchSize < operations.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setResults(syncResults);
      setProgress({ current: operations.length, total: operations.length, status: 'completed' });

      const successful = syncResults.filter(r => r.success && r.old_status !== r.new_status).length;
      const failed = syncResults.filter(r => !r.success).length;

      console.log(`🎯 [SMART_SYNC] Concluído: ${successful} atualizadas, ${failed} falhas`);

      toast({
        title: "Sincronização Concluída",
        description: `${successful} operações atualizadas, ${failed} falhas`,
        variant: successful > 0 ? "default" : failed > 0 ? "destructive" : "default"
      });

    } catch (error: any) {
      console.error('❌ [SMART_SYNC] Erro:', error);
      setProgress(prev => ({ ...prev, status: 'error' }));
      toast({
        title: "Erro na Sincronização",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const reset = () => {
    setProgress({ current: 0, total: 0, status: 'idle' });
    setResults([]);
  };

  return {
    progress,
    results,
    syncWithAPI,
    reset
  };
};
