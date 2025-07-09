
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { makeApiRequest } from '../services/pagarmeService';

export const useStatusDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 [DIAGNOSTICS] Iniciando diagnóstico...');
      
      // Buscar operações problemáticas do Supabase
      const { data: operations, error } = await supabase
        .from('pagarme_operations')
        .select('*')
        .eq('payment_method', 'credit_card')
        .eq('status', 'waiting_funds')
        .gte('created_at', '2025-07-08')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!operations || operations.length === 0) {
        setDiagnostics([]);
        toast({
          title: "Nenhuma anomalia encontrada",
          description: "Todas as operações estão com status correto"
        });
        return;
      }

      console.log(`🔍 [DIAGNOSTICS] Analisando ${operations.length} operações...`);

      const apiKey = localStorage.getItem('pagarme_api_key');
      if (!apiKey) {
        throw new Error('Chave API não encontrada');
      }

      const results = [];
      
      for (const operation of operations) {
        try {
          // Para API v5 do Pagar.me, usar endpoint correto para charges
          // Se temos um charge_id, usar /core/v5/charges/{id}
          // Se não, usar /core/v5/orders/{id} e depois buscar charges
          
          let apiStatus = null;
          let apiResponse = null;
          
          try {
            // Primeiro, tentar buscar como charge diretamente
            apiResponse = await makeApiRequest(`/core/v5/charges/${operation.external_id}`, apiKey);
            apiStatus = apiResponse?.status;
            console.log(`✅ [DIAGNOSTICS] Charge ${operation.external_id}: ${apiStatus}`);
          } catch (chargeError) {
            console.log(`⚠️ [DIAGNOSTICS] Charge não encontrado, tentando como order...`);
            
            try {
              // Se não encontrar como charge, tentar como order
              const orderResponse = await makeApiRequest(`/core/v5/orders/${operation.external_id}`, apiKey);
              
              if (orderResponse?.charges?.[0]) {
                apiStatus = orderResponse.charges[0].status;
                console.log(`✅ [DIAGNOSTICS] Order ${operation.external_id}, charge status: ${apiStatus}`);
              }
            } catch (orderError) {
              console.log(`❌ [DIAGNOSTICS] Não encontrado como order: ${orderError.message}`);
              
              // Última tentativa: buscar como transaction
              try {
                const transactionResponse = await makeApiRequest(`/core/v5/transactions/${operation.external_id}`, apiKey);
                apiStatus = transactionResponse?.status;
                console.log(`✅ [DIAGNOSTICS] Transaction ${operation.external_id}: ${apiStatus}`);
              } catch (transactionError) {
                console.log(`❌ [DIAGNOSTICS] Não encontrado como transaction: ${transactionError.message}`);
              }
            }
          }

          // Calcular horas desde criação
          const createdAt = new Date(operation.created_at);
          const now = new Date();
          const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

          // Determinar se é anomalia e calcular confiança
          const isAnomaly = operation.status === 'waiting_funds' && hoursSinceCreation > 2;
          let confidence = 0;
          let suggestedStatus = operation.status;

          if (isAnomaly) {
            if (apiStatus) {
              // Se temos status da API, usar ele
              suggestedStatus = apiStatus;
              confidence = 95;
            } else {
              // Se não conseguimos consultar API, usar regra de negócio
              if (hoursSinceCreation > 48) {
                suggestedStatus = 'captured';
                confidence = 90;
              } else if (hoursSinceCreation > 24) {
                suggestedStatus = 'captured';
                confidence = 85;
              } else if (hoursSinceCreation > 6) {
                suggestedStatus = 'captured';
                confidence = 75;
              }
            }
          }

          results.push({
            external_id: operation.external_id,
            current_status: operation.status,
            suggested_status: suggestedStatus,
            api_status: apiStatus,
            amount: operation.amount,
            hours_since_creation: hoursSinceCreation,
            confidence,
            is_anomaly: isAnomaly,
            created_at: operation.created_at
          });

        } catch (error) {
          console.error(`❌ [DIAGNOSTICS] Erro ao processar ${operation.external_id}:`, error);
          
          // Adicionar resultado com erro, mas ainda pode ser corrigido por regra de negócio
          const createdAt = new Date(operation.created_at);
          const hoursSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
          
          results.push({
            external_id: operation.external_id,
            current_status: operation.status,
            suggested_status: hoursSinceCreation > 24 ? 'captured' : operation.status,
            api_status: null,
            amount: operation.amount,
            hours_since_creation: hoursSinceCreation,
            confidence: hoursSinceCreation > 24 ? 70 : 0,
            is_anomaly: hoursSinceCreation > 2,
            created_at: operation.created_at,
            error: error.message
          });
        }
      }

      setDiagnostics(results);
      
      const anomalies = results.filter(r => r.is_anomaly);
      toast({
        title: "Diagnóstico concluído",
        description: `${anomalies.length} anomalias encontradas de ${results.length} operações analisadas`
      });

    } catch (error: any) {
      console.error('❌ [DIAGNOSTICS] Erro:', error);
      toast({
        title: "Erro no diagnóstico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyCorrections = async (corrections: any[]) => {
    if (corrections.length === 0) return;

    setLoading(true);
    try {
      console.log(`🔧 [CORRECTIONS] Aplicando ${corrections.length} correções...`);

      const updates = corrections.map(correction => ({
        external_id: correction.external_id,
        status: correction.suggested_status,
        updated_at: new Date().toISOString()
      }));

      // Aplicar correções em lotes
      const batchSize = 10;
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        const externalIds = batch.map(u => u.external_id);
        
        const { error } = await supabase
          .from('pagarme_operations')
          .update({
            status: batch[0].status,
            updated_at: new Date().toISOString()
          })
          .in('external_id', externalIds);

        if (error) throw error;
      }

      toast({
        title: "✅ Correções aplicadas",
        description: `${corrections.length} operações corrigidas com sucesso`
      });

      // Limpar diagnósticos após aplicar
      setDiagnostics([]);

    } catch (error: any) {
      console.error('❌ [CORRECTIONS] Erro:', error);
      toast({
        title: "Erro ao aplicar correções",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    diagnostics,
    loading,
    runDiagnostics,
    applyCorrections
  };
};
