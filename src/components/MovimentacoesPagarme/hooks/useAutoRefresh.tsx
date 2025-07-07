
import { useEffect, useRef } from 'react';

interface UseAutoRefreshProps {
  onRefresh: () => void;
  intervalMs?: number;
  enabled?: boolean;
}

export const useAutoRefresh = ({ 
  onRefresh, 
  intervalMs = 60 * 60 * 1000, // 1 hora por padrão
  enabled = true 
}: UseAutoRefreshProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log(`🔄 Configurando atualização automática a cada ${intervalMs / 1000 / 60} minutos`);
    
    intervalRef.current = setInterval(() => {
      console.log('🔄 Executando atualização automática...');
      onRefresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [onRefresh, intervalMs, enabled]);

  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏹️ Atualização automática interrompida');
    }
  };

  const startAutoRefresh = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(() => {
        console.log('🔄 Executando atualização automática...');
        onRefresh();
      }, intervalMs);
      console.log('▶️ Atualização automática iniciada');
    }
  };

  return {
    stopAutoRefresh,
    startAutoRefresh,
    isRunning: intervalRef.current !== null
  };
};
