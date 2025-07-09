
/**
 * Balance operations service for Pagar.me
 * Handles balance queries and recipient operations
 */

import { makeApiRequest } from './apiClient';

// Função para buscar saldo com CORREÇÃO definitiva - API v5
export const fetchBalance = async (apiKey: string): Promise<{ available: number; pending: number }> => {
  try {
    console.log('💰 [SALDO] Buscando saldo...');
    
    const recipientResponse = await makeApiRequest('/core/v5/recipients?size=1', apiKey);
    
    if (!recipientResponse?.data?.[0]?.id) {
      console.warn('⚠️ [SALDO] Recipient não encontrado');
      return { available: 0, pending: 0 };
    }
    
    const recipientId = recipientResponse.data[0].id;
    console.log(`💰 [SALDO] Recipient ID: ${recipientId}`);
    
    const balanceResponse = await makeApiRequest(`/core/v5/recipients/${recipientId}/balance`, apiKey);
    
    // CORREÇÃO DEFINITIVA: Valores vêm em centavos, converter para reais
    const available = (balanceResponse?.available_amount || 0) / 100;
    const pending = (balanceResponse?.waiting_funds_amount || 0) / 100;
    
    console.log(`💰 [SALDO] CORRETO - Disponível: R$ ${available.toFixed(2)}, Pendente: R$ ${pending.toFixed(2)}`);
    
    return { available, pending };
    
  } catch (error) {
    console.error('❌ [SALDO] Erro:', error);
    return { available: 0, pending: 0 };
  }
};
