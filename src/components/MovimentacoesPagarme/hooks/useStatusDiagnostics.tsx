
/**
 * Hook para diagnóstico inteligente de status
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StatusDiagnostic {
  external_id: string;
  current_status: string;
  api_status?: string;
  created_at: string;
  amount: number;
  payment_method: string;
  hours_since_creation: number;
  is_anomaly: boolean;
  suggested_status: string;
  confidence: number;
}

export const useStatusDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<StatusDiagnostic[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      console.log('🔍 [DIAGNOSTICS] Iniciando análise completa...');

      // Buscar operações suspeitas do banco
      const { data: operations, error } = await supabase
        .from('pagarme_operations')
        .select('*')
        .eq('payment_method', 'credit_card')
        .gte('created_at', '2025-07-08')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const diagnosticsResults: StatusDiagnostic[] = [];
      const apiKey = localStorage.getItem('pagarme_api_key');

      for (const op of operations || []) {
        const createdAt = new Date(op.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

        // Determinar se é anomalia
        const isAnomaly = 
          op.status === 'waiting_funds' && 
          hoursSinceCreation > 2 && 
          op.payment_method === 'credit_card';

        // Sugerir status baseado em regras de negócio
        let suggestedStatus = op.status;
        let confidence = 100;

        if (isAnomaly) {
          if (hoursSinceCreation > 24) {
            suggestedStatus = 'captured';
            confidence = 95;
          } else if (hoursSinceCreation > 4) {
            suggestedStatus = 'captured';
            confidence = 85;
          } else {
            suggestedStatus = 'processing';
            confidence = 70;
          }
        }

        // Tentar buscar status real da API se disponível
        let apiStatus;
        if (apiKey && isAnomaly) {
          try {
            const response = await fetch('/api/pagarme-proxy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                endpoint: `/core/v5/payables/${op.external_id}`,
                apiKey: apiKey
              })
            });

            if (response.ok) {
              const apiData = await response.json();
              apiStatus = apiData.status;
              
              if (apiStatus && apiStatus !== op.status) {
                suggestedStatus = apiStatus;
                confidence = 100;
              }
            }
          } catch (error) {
            console.warn(`Erro ao buscar status da API para ${op.external_id}:`, error);
          }
        }

        diagnosticsResults.push({
          external_id: op.external_id,
          current_status: op.status,
          api_status: apiStatus,
          created_at: op.created_at,
          amount: op.amount,
          payment_method: op.payment_method,
          hours_since_creation: hoursSinceCreation,
          is_anomaly: isAnomaly,
          suggested_status: suggestedStatus,
          confidence: confidence
        });
      }

      setDiagnostics(diagnosticsResults);

      const anomalies = diagnosticsResults.filter(d => d.is_anomaly);
      console.log(`🔍 [DIAGNOSTICS] Análise completa: ${diagnosticsResults.length} operações, ${anomalies.length} anomalias`);

      toast({
        title: "Diagnóstico Concluído",
        description: `${diagnosticsResults.length} operações analisadas, ${anomalies.length} anomalias detectadas`
      });

    } catch (error: any) {
      console.error('❌ [DIAGNOSTICS] Erro:', error);
      toast({
        title: "Erro no Diagnóstico",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyCorrections = async (corrections: StatusDiagnostic[]) => {
    setLoading(true);
    try {
      console.log('🔧 [CORRECTIONS] Aplicando correções...', corrections.length);

      for (const correction of corrections) {
        const { error } = await supabase
          .from('pagarme_operations')
          .update({ 
            status: correction.suggested_status,
            updated_at: new Date().toISOString()
          })
          .eq('external_id', correction.external_id);

        if (error) {
          console.error(`Erro ao corrigir ${correction.external_id}:`, error);
        }
      }

      toast({
        title: "✅ Correções Aplicadas",
        description: `${corrections.length} operações corrigidas com sucesso`
      });

      // Limpar diagnósticos após aplicar
      setDiagnostics([]);

    } catch (error: any) {
      console.error('❌ [CORRECTIONS] Erro:', error);
      toast({
        title: "Erro nas Correções",
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
