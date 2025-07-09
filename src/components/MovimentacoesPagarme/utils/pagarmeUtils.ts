
/**
 * Utilitários para processamento de dados do Pagar.me
 * VERSÃO CORRIGIDA - PRIORIZA STATUS REAL DAS TRANSAÇÕES
 */

// Validação da chave API
export const validateApiKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }
  const cleanKey = key.trim();
  return cleanKey.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(cleanKey);
};

// Função para extrair código numérico real da transação/pedido
export const extractRealTransactionCode = (item: any): string => {
  // PRIORIDADE 1: Código do pedido/order (como 45812, 45811)
  if (item.code && typeof item.code === 'string') {
    if (/^\d+$/.test(item.code)) {
      return item.code;
    }
  }
  
  // PRIORIDADE 2: Reference key numérico
  if (item.reference_key && /^\d+$/.test(item.reference_key)) {
    return item.reference_key;
  }
  
  // PRIORIDADE 3: Gateway ID se for numérico
  if (item.gateway_id && /^\d+$/.test(String(item.gateway_id))) {
    return String(item.gateway_id);
  }
  
  // PRIORIDADE 4: Extrair números do ID
  const idStr = String(item.id || '');
  const numericPart = idStr.replace(/[^0-9]/g, '');
  
  if (numericPart.length >= 4) {
    return numericPart.substring(0, 6);
  }
  
  // Fallback: gerar código sequencial baseado no timestamp
  const timestamp = Date.now();
  return String(timestamp).slice(-5);
};

// Função para determinar o STATUS REAL da transação/pedido
const getRealTransactionStatus = (order: any, charge: any): string => {
  // PRIORIDADE 1: Status do order (mais confiável)
  if (order.status) {
    // Mapeamento dos status reais dos orders
    switch (order.status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'pending':
      case 'waiting_payment':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'canceled':
      case 'cancelled':
        return 'refused';
      case 'failed':
        return 'refused';
      default:
        return order.status;
    }
  }
  
  // PRIORIDADE 2: Status do charge/transação
  if (charge?.status) {
    switch (charge.status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'pending':
      case 'waiting_payment':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'canceled':
      case 'cancelled':
      case 'failed':
        return 'refused';
      default:
        return charge.status;
    }
  }
  
  // PRIORIDADE 3: Status da última transação
  if (charge?.last_transaction?.status) {
    switch (charge.last_transaction.status.toLowerCase()) {
      case 'paid':
        return 'paid';
      case 'authorized':
        return 'paid'; // Cartão autorizado = pago
      case 'pending':
        return 'pending';
      case 'processing':
        return 'processing';
      case 'refused':
      case 'failed':
        return 'refused';
      default:
        return charge.last_transaction.status;
    }
  }
  
  return 'unknown';
};

// Função para extrair dados detalhados
const extractDetailedData = (item: any, source: string = 'unknown') => {
  const card = item.card || item.last_transaction?.card || {};
  const transaction = item.last_transaction || item.transaction || item;
  
  return {
    payment_method: item.payment_method || transaction.payment_method || 'unknown',
    installments: Number(item.installments) || Number(transaction.installments) || 1,
    
    // Dados do adquirente
    acquirer_name: item.acquirer_name || transaction.acquirer_name,
    acquirer_response_code: item.acquirer_response_code || transaction.acquirer_response_code,
    
    // Códigos de autorização
    authorization_code: item.authorization_code || transaction.authorization_code,
    tid: item.tid || transaction.tid,
    nsu: item.nsu || transaction.nsu,
    
    // Dados do cartão
    card_brand: card.brand || item.card_brand || transaction.card_brand,
    card_last_four_digits: card.last_four_digits || item.card_last_four_digits || transaction.card_last_four_digits,
    
    // Dados técnicos
    soft_descriptor: item.soft_descriptor || transaction.soft_descriptor,
    gateway_response_time: item.gateway_response_time || transaction.gateway_response_time,
    antifraud_score: item.antifraud_score || transaction.antifraud_score,
    
    // Dados adicionais
    gateway_id: item.gateway_id || transaction.gateway_id,
    reference_key: item.reference_key || transaction.reference_key,
    
    // Metadata
    source,
    extracted_at: new Date().toISOString()
  };
};

// CORREÇÃO PRINCIPAL: Mapear orders com STATUS REAL (não dos payables)
export const mapOrdersToOperations = (ordersData: any[]): any[] => {
  console.log('🔄 [MAPEAMENTO] Processando orders com STATUS CORRETO...');
  
  return ordersData.map((order: any, index: number) => {
    const charge = order.charges?.[0] || {};
    const customer = order.customer || {};
    
    // Filtrar apenas PIX e cartão de crédito
    const paymentMethod = charge.payment_method;
    if (!paymentMethod || (paymentMethod !== 'pix' && paymentMethod !== 'credit_card')) {
      return null;
    }
    
    // CORREÇÃO: Usar STATUS REAL da transação/pedido
    const realStatus = getRealTransactionStatus(order, charge);
    
    // Extrair dados detalhados
    const detailedData = extractDetailedData(charge, 'order');
    
    // CORREÇÃO: Usar valor TOTAL do order (não individual dos payables)
    const totalAmount = (Number(order.amount) || 0) / 100;
    const totalFee = (Number(charge.fee) || Number(charge.last_transaction?.fee) || 0) / 100;
    
    console.log(`📋 [ORDER] ${order.code}: Status real = ${realStatus}, Valor = R$ ${totalAmount.toFixed(2)}`);
    
    return {
      id: String(order.id || `order_${index}`),
      type: 'order',
      status: realStatus, // STATUS CORRIGIDO
      amount: totalAmount, // VALOR TOTAL CORRETO
      fee: totalFee,
      created_at: order.created_at || new Date().toISOString(),
      description: `Pedido ${order.code || extractRealTransactionCode(order)} - ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'} - ${realStatus.toUpperCase()}`,
      
      // Dados completos extraídos
      ...detailedData,
      
      // Dados específicos do order
      transaction_id: charge.id || charge.last_transaction?.id,
      order_id: order.id,
      customer: customer,
      billing: order.billing,
      real_code: order.code || extractRealTransactionCode(order),
      
      // Informações adicionais para debug
      original_order_status: order.status,
      original_charge_status: charge.status,
      payment_date: order.paid_at || charge.paid_at
    };
  }).filter(Boolean);
};

// AJUSTE: Mapear payables APENAS quando necessário (recebíveis futuros)
export const mapPayablesToOperations = (payablesData: any[]): any[] => {
  console.log('🔄 [MAPEAMENTO] Processando payables (recebíveis futuros)...');
  
  return payablesData
    .filter((payable: any) => {
      const paymentMethod = payable.payment_method;
      // Só incluir payables que são realmente recebíveis futuros
      return (paymentMethod === 'pix' || paymentMethod === 'credit_card') && 
             payable.status === 'waiting_funds'; // Apenas os que ainda estão aguardando
    })
    .map((payable: any) => {
      const detailedData = extractDetailedData(payable, 'payable');
      
      return {
        id: String(payable.id),
        type: 'payable',
        status: 'waiting_funds', // Status específico para recebíveis
        amount: (Number(payable.amount) || 0) / 100,
        fee: (Number(payable.fee) || 0) / 100,
        created_at: payable.created_at || new Date().toISOString(),
        description: `Recebível ${payable.payment_method === 'pix' ? 'PIX' : 'Cartão'} - Aguardando`,
        
        // Dados completos extraídos
        ...detailedData,
        
        // Dados específicos dos payables
        charge_id: payable.charge_id,
        recipient_id: payable.recipient_id,
        payment_date: payable.payment_date,
        anticipation_fee: (Number(payable.anticipation_fee) || 0) / 100,
        fraud_coverage_fee: (Number(payable.fraud_coverage_fee) || 0) / 100,
        real_code: extractRealTransactionCode(payable)
      };
    });
};

// Mapear transações diretas
export const mapTransactions = (transactionsData: any[]): any[] => {
  return transactionsData
    .filter((transaction: any) => {
      const paymentMethod = transaction.payment_method;
      return paymentMethod === 'pix' || paymentMethod === 'credit_card';
    })
    .map((transaction: any) => {
      const detailedData = extractDetailedData(transaction, 'transaction');
      
      // Determinar status real da transação
      let realStatus = transaction.status || 'unknown';
      if (transaction.status === 'authorized') {
        realStatus = 'paid'; // Transação autorizada = paga
      }
      
      return {
        id: String(transaction.id),
        amount: (Number(transaction.amount) || 0) / 100,
        status: realStatus,
        payment_method: transaction.payment_method || 'unknown',
        created_at: transaction.created_at || new Date().toISOString(),
        paid_at: transaction.paid_at,
        fee: (Number(transaction.fee) || 0) / 100,
        
        // Dados completos extraídos
        ...detailedData,
        
        // Dados específicos das transações
        customer: transaction.customer,
        billing: transaction.billing,
        boleto: transaction.boleto,
        pix: transaction.pix,
        real_code: extractRealTransactionCode(transaction)
      };
    });
};
