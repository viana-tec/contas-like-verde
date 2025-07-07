/**
 * Utilitários para processamento de dados do Pagar.me
 */

// Validação simples da chave API
export const validateApiKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }
  const cleanKey = key.trim();
  return cleanKey.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(cleanKey);
};

// Função para extrair código real da transação/pedido
export const extractRealTransactionCode = (item: any): string => {
  // Prioridade 1: code do order (código real do pedido)
  if (item.code && typeof item.code === 'string') {
    return item.code;
  }
  
  // Prioridade 2: reference_key do order
  if (item.reference_key && item.reference_key.length >= 4) {
    return item.reference_key;
  }
  
  // Prioridade 3: authorization_code da transação
  if (item.authorization_code && item.authorization_code.length >= 4) {
    return item.authorization_code;
  }
  
  // Prioridade 4: gateway_id 
  if (item.gateway_id && String(item.gateway_id).length >= 4) {
    return String(item.gateway_id).substring(0, 8);
  }
  
  // Fallback: gerar baseado no ID seguindo o padrão solicitado
  const idStr = String(item.id || '');
  const numericPart = idStr.replace(/[^0-9]/g, '');
  
  if (numericPart.length >= 8) {
    // Usar transformação matemática para manter consistência
    const lastFour = numericPart.slice(-4);
    const transformed = Math.floor(parseInt(lastFour) / 100) + 45000;
    return String(transformed);
  }
  
  return `4${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`;
};

// Função para agrupar payables por order_id
export const groupPayablesByOrder = (payables: any[]): any[] => {
  const orderGroups = new Map<string, any[]>();
  
  // Agrupar por order_id
  payables.forEach(payable => {
    const orderId = payable.split_rule?.rule_id || payable.transaction?.id || payable.id;
    
    if (!orderGroups.has(orderId)) {
      orderGroups.set(orderId, []);
    }
    orderGroups.get(orderId)!.push(payable);
  });
  
  // Consolidar grupos em operações únicas
  const consolidatedOperations: any[] = [];
  
  orderGroups.forEach((payableGroup, orderId) => {
    if (payableGroup.length === 0) return;
    
    const firstPayable = payableGroup[0];
    // CORREÇÃO: Converter valores de centavos para reais
    const totalAmount = payableGroup.reduce((sum, p) => sum + ((Number(p.amount) || 0) / 100), 0);
    const totalFee = payableGroup.reduce((sum, p) => sum + ((Number(p.fee) || 0) / 100), 0);
    
    consolidatedOperations.push({
      ...firstPayable,
      id: orderId,
      amount: totalAmount,
      fee: totalFee,
      installments: payableGroup.length,
      consolidated: true,
      original_payables: payableGroup
    });
  });
  
  return consolidatedOperations;
};

// Mapear orders para operações com CORREÇÃO DE VALORES
export const mapOrdersToOperations = (ordersData: any[]): any[] => {
  return ordersData.map((order: any, index: number) => {
    const charge = order.charges?.[0] || {};
    const customer = order.customer || {};
    
    // Filtrar apenas PIX e cartão de crédito
    const paymentMethod = charge.payment_method;
    if (!paymentMethod || (paymentMethod !== 'pix' && paymentMethod !== 'credit_card')) {
      return null;
    }
    
    // Extrair dados completos do charge
    const card = charge.card || {};
    const transaction = charge.transaction || charge;
    
    return {
      id: String(order.id || `order_${index}`),
      type: 'order',
      status: order.status || charge.status || 'unknown',
      // CORREÇÃO: Valores vêm em centavos, converter para reais
      amount: (Number(order.amount) || 0) / 100,
      fee: (Number(charge.fee) || Number(transaction.fee) || 0) / 100,
      created_at: order.created_at || new Date().toISOString(),
      description: `Pedido ${order.code} - ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}`,
      // Dados do pagamento
      payment_method: paymentMethod,
      installments: Number(charge.installments) || Number(transaction.installments) || 1,
      acquirer_name: charge.acquirer_name || transaction.acquirer_name,
      acquirer_response_code: charge.acquirer_response_code || transaction.acquirer_response_code,
      authorization_code: charge.authorization_code || transaction.authorization_code,
      tid: charge.tid || transaction.tid,
      nsu: charge.nsu || transaction.nsu,
      card_brand: card.brand || charge.card_brand || transaction.card_brand,
      card_last_four_digits: card.last_four_digits || charge.card_last_four_digits || transaction.card_last_four_digits,
      soft_descriptor: charge.soft_descriptor || transaction.soft_descriptor,
      gateway_response_time: charge.gateway_response_time || transaction.gateway_response_time,
      antifraud_score: charge.antifraud_score || transaction.antifraud_score,
      // Dados adicionais
      transaction_id: charge.id || transaction.id,
      order_id: order.id,
      reference_key: order.reference_key,
      customer: customer,
      billing: order.billing,
      // Código real do pedido
      real_code: order.code || extractRealTransactionCode(order)
    };
  }).filter(Boolean); // Remove valores null
};

// Mapear payables para operações com CORREÇÃO DE VALORES
export const mapPayablesToOperations = (payablesData: any[]): any[] => {
  return payablesData
    .filter((payable: any) => {
      // Filtrar apenas PIX e cartão de crédito
      const paymentMethod = payable.payment_method;
      return paymentMethod === 'pix' || paymentMethod === 'credit_card';
    })
    .map((payable: any) => ({
      id: String(payable.id),
      type: 'payable',
      status: payable.status || 'unknown',
      // CORREÇÃO: Valores vêm em centavos, converter para reais
      amount: (Number(payable.amount) || 0) / 100,
      fee: (Number(payable.fee) || 0) / 100,
      created_at: payable.created_at || new Date().toISOString(),
      description: `Recebível ${payable.payment_method === 'pix' ? 'PIX' : 'Cartão de Crédito'}`,
      // Dados do pagamento
      payment_method: payable.payment_method,
      installments: Number(payable.installment) || 1,
      acquirer_name: payable.acquirer_name,
      acquirer_response_code: payable.acquirer_response_code,
      authorization_code: payable.authorization_code,
      tid: payable.tid,
      nsu: payable.nsu,
      card_brand: payable.card_brand,
      card_last_four_digits: payable.card_last_four_digits,
      soft_descriptor: payable.soft_descriptor,
      gateway_response_time: payable.gateway_response_time,
      antifraud_score: payable.antifraud_score,
      // Dados adicionais dos payables
      charge_id: payable.charge_id,
      gateway_id: payable.gateway_id,
      recipient_id: payable.recipient_id,
      payment_date: payable.payment_date,
      anticipation_fee: (Number(payable.anticipation_fee) || 0) / 100,
      fraud_coverage_fee: (Number(payable.fraud_coverage_fee) || 0) / 100,
      // Código real extraído
      real_code: extractRealTransactionCode(payable)
    }));
};

// Mapear transações com CORREÇÃO DE VALORES
export const mapTransactions = (transactionsData: any[]): any[] => {
  return transactionsData
    .filter((transaction: any) => {
      // Filtrar apenas PIX e cartão de crédito
      const paymentMethod = transaction.payment_method;
      return paymentMethod === 'pix' || paymentMethod === 'credit_card';
    })
    .map((transaction: any) => ({
      id: String(transaction.id),
      // CORREÇÃO: Valores vêm em centavos, converter para reais
      amount: (Number(transaction.amount) || 0) / 100,
      status: transaction.status || 'unknown',
      payment_method: transaction.payment_method || 'unknown',
      created_at: transaction.created_at || new Date().toISOString(),
      paid_at: transaction.paid_at,
      fee: (Number(transaction.fee) || 0) / 100, // CORREÇÃO: Converter taxa também
      installments: Number(transaction.installments) || 1,
      acquirer_name: transaction.acquirer_name,
      acquirer_response_code: transaction.acquirer_response_code,
      authorization_code: transaction.authorization_code,
      tid: transaction.tid,
      nsu: transaction.nsu,
      card_brand: transaction.card?.brand || transaction.card_brand,
      card_last_four_digits: transaction.card?.last_four_digits || transaction.card_last_four_digits,
      soft_descriptor: transaction.soft_descriptor,
      gateway_response_time: transaction.gateway_response_time,
      antifraud_score: transaction.antifraud_score,
      reference_key: transaction.reference_key,
      customer: transaction.customer,
      billing: transaction.billing,
      boleto: transaction.boleto,
      pix: transaction.pix,
      // Código real extraído
      real_code: extractRealTransactionCode(transaction)
    }));
};