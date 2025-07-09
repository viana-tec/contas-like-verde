
/**
 * Utilities for Pagar.me API integration
 */

import { BalanceOperation } from '../types';

export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  const trimmed = apiKey.trim();
  return trimmed.length >= 10 && (trimmed.startsWith('sk_') || trimmed.startsWith('ak_'));
};

// Função para mapear charges para operações de saldo COM TAXAS
export const mapChargesToOperations = (charges: any[]): BalanceOperation[] => {
  console.log(`🔄 [MAPPER] Mapeando ${charges.length} charges para operações...`);
  
  const operations = charges.map((charge): BalanceOperation => {
    // Calcular taxa (fee) a partir dos dados da charge
    let fee = 0;
    
    // Tentar extrair fee de diferentes campos possíveis
    if (charge.fee) {
      fee = typeof charge.fee === 'number' ? charge.fee : parseFloat(charge.fee) || 0;
    } else if (charge.gateway_fee) {
      fee = typeof charge.gateway_fee === 'number' ? charge.gateway_fee : parseFloat(charge.gateway_fee) || 0;
    } else if (charge.acquirer_fee) {
      fee = typeof charge.acquirer_fee === 'number' ? charge.acquirer_fee : parseFloat(charge.acquirer_fee) || 0;
    } else if (charge.amount && charge.net_amount) {
      // Calcular fee como diferença entre amount e net_amount
      const amount = typeof charge.amount === 'number' ? charge.amount : parseFloat(charge.amount) || 0;
      const netAmount = typeof charge.net_amount === 'number' ? charge.net_amount : parseFloat(charge.net_amount) || 0;
      fee = amount - netAmount;
    }
    
    // Converter valores de centavos para reais se necessário
    const amount = typeof charge.amount === 'number' ? charge.amount / 100 : parseFloat(charge.amount) / 100 || 0;
    const feeInReais = fee > 0 ? fee / 100 : 0;
    
    console.log(`💰 [CHARGE] ${charge.id}: R$ ${amount.toFixed(2)} (Taxa: R$ ${feeInReais.toFixed(2)})`);
    
    return {
      id: charge.id,
      type: 'charge',
      status: charge.status || 'unknown',
      amount: amount,
      fee: feeInReais, // TAXA RESTAURADA
      created_at: charge.created_at || new Date().toISOString(),
      updated_at: charge.updated_at || new Date().toISOString(),
      description: charge.description || `Cobrança ${charge.id}`,
      
      // Campos de pagamento
      payment_method: charge.payment_method || charge.last_transaction?.payment_method || 'unknown',
      installments: charge.installments || charge.last_transaction?.installments || 1,
      
      // Campos da adquirente
      acquirer_name: charge.last_transaction?.acquirer_name || charge.acquirer_name || 'unknown',
      acquirer_response_code: charge.last_transaction?.acquirer_response_code,
      authorization_code: charge.last_transaction?.authorization_code,
      tid: charge.last_transaction?.tid,
      nsu: charge.last_transaction?.nsu,
      
      // Campos do cartão
      card_brand: charge.last_transaction?.card?.brand || charge.card_brand,
      card_last_four_digits: charge.last_transaction?.card?.last_four_digits || charge.card_last_four_digits,
      
      // Campos adicionais
      soft_descriptor: charge.last_transaction?.soft_descriptor,
      gateway_response_time: charge.last_transaction?.gateway_response_time,
      antifraud_score: charge.last_transaction?.antifraud_score,
      
      // Campos de referência
      real_code: charge.code,
      reference_key: charge.reference_key,
      order_id: charge.order_id,
      transaction_id: charge.last_transaction?.id
    };
  });
  
  console.log(`✅ [MAPPER] ${operations.length} operações mapeadas com sucesso`);
  return operations;
};
