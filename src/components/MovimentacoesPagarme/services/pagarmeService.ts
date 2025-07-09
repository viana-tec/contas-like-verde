
/**
 * Main service facade for Pagar.me API operations
 * Combines all service modules into a single interface
 * CORRIGIDO PARA USAR PAYABLES
 */

// Re-export all services for backward compatibility
export { makeApiRequest, testConnection, fetchTransactionDetails } from './apiClient';
export { fetchAllDataUnlimited, fetchAllData } from './dataCollector';
export { fetchBalance } from './balanceService';

// Import the functions we need for the main service
import { fetchAllData } from './dataCollector';
import { fetchBalance } from './balanceService';

// Main service function that combines all operations - CORRIGIDO
export const fetchAllDataWithBalance = async (
  apiKey: string,
  onProgress?: (stage: string, current: number, total: number, info: string) => void
) => {
  console.log('🚀 [SERVICE] Iniciando coleta completa com payables...');
  
  const { payablesData, transactionsData, ordersData } = await fetchAllData(apiKey, onProgress);
  
  // FASE 3: Buscar saldo
  console.log('🚀 [FASE 3] Buscando saldo atualizado...');
  onProgress?.('Buscando saldo', 3, 3, 'Consultando saldo disponível...');
  const balanceData = await fetchBalance(apiKey);
  
  console.log(`✅ [SERVICE] Coleta completa finalizada: ${payablesData.length} payables, saldo disponível: R$ ${balanceData.available / 100}`);
  
  return {
    payablesData,
    transactionsData,
    ordersData,
    balanceData
  };
};
