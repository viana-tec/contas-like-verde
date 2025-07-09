
/**
 * Utilities for Pagar.me API integration
 * CORRIGIDO PARA PAYABLES
 */

import { BalanceOperation } from '../types';

export const validateApiKey = (apiKey: string): boolean => {
  if (!apiKey || typeof apiKey !== 'string') return false;
  const trimmed = apiKey.trim();
  return trimmed.length >= 10 && (trimmed.startsWith('sk_') || trimmed.startsWith('ak_'));
};

// Função para mapear PAYABLES para operações de saldo COM TAXAS - CORRIGIDA
export const mapChargesToOperations = (payables: any[]): BalanceOperation[] => {
  console.log(`🔄 [MAPPER] Mapeando ${payables.length} payables para operações...`);
  
  const operations = payables.map((payable): BalanceOperation => {
    // Calcular taxa (fee) corretamente dos payables
    let fee = 0;
    
    // Nos payables, a taxa geralmente está em 'fee' ou pode ser calculada
    if (payable.fee) {
      fee = typeof payable.fee === 'number' ? payable.fee : parseFloat(payable.fee) || 0;
    } else if (payable.anticipation_fee) {
      fee = typeof payable.anticipation_fee === 'number' ? payable.anticipation_fee : parseFloat(payable.anticipation_fee) || 0;
    } else if (payable.amount && payable.net_amount) {
      // Calcular fee como diferença entre amount e net_amount
      const amount = typeof payable.amount === 'number' ? payable.amount : parseFloat(payable.amount) || 0;
      const netAmount = typeof payable.net_amount === 'number' ? payable.net_amount : parseFloat(payable.net_amount) || 0;
      fee = amount - netAmount;
    }
    
    // Converter valores de centavos para reais
    const amount = typeof payable.amount === 'number' ? payable.amount / 100 : parseFloat(payable.amount) / 100 || 0;
    const feeInReais = fee > 0 ? fee / 100 : 0;
    
    console.log(`💰 [PAYABLE] ${payable.id}: R$ ${amount.toFixed(2)} (Taxa: R$ ${feeInReais.toFixed(2)})`);
    
    // Extrair informações da transação relacionada
    const transaction = payable.transaction || {};
    const charge = transaction.charge || payable.charge || {};
    
    return {
      id: payable.id,
      type: payable.type || 'payable',
      status: payable.status || 'unknown',
      amount: amount,
      fee: feeInReais, // TAXA CORRETAMENTE CALCULADA
      created_at: payable.date_created || payable.created_at || new Date().toISOString(),
      updated_at: payable.date_updated || payable.updated_at || new Date().toISOString(),
      description: `Recebível ${payable.id} - ${payable.type || 'credit'}`,
      
      // Campos de pagamento da transação
      payment_method: transaction.payment_method || charge.payment_method || 'unknown',
      installments: payable.installment || transaction.installments || 1,
      
      // Campos da adquirente
      acquirer_name: transaction.acquirer_name || 'unknown',
      acquirer_response_code: transaction.acquirer_response_code,
      authorization_code: transaction.authorization_code,
      tid: transaction.tid,
      nsu: transaction.nsu,
      
      // Campos do cartão
      card_brand: transaction.card_brand || charge.card_brand,
      card_last_four_digits: transaction.card_last_four_digits || charge.card_last_four_digits,
      
      // Campos adicionais
      soft_descriptor: transaction.soft_descriptor,
      gateway_response_time: transaction.gateway_response_time,
      antifraud_score: transaction.antifraud_score,
      
      // Campos de referência do payable
      real_code: payable.id,
      reference_key: charge.reference_key || transaction.reference_key,
      order_id: charge.order_id,
      transaction_id: transaction.id
    };
  });
  
  console.log(`✅ [MAPPER] ${operations.length} operações mapeadas com sucesso`);
  return operations;
};
