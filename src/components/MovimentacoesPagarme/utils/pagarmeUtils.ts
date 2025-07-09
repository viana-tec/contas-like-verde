
/**
 * Utilitários para processamento de dados do Pagar.me
 * VERSÃO OTIMIZADA COM EXTRAÇÃO COMPLETA DE DADOS
 */

// Validação da chave API
export const validateApiKey = (key: string): boolean => {
  if (!key || typeof key !== 'string') {
    return false;
  }
  const cleanKey = key.trim();
  return cleanKey.length >= 10 && /^[a-zA-Z0-9_-]+$/.test(cleanKey);
};

// Função OTIMIZADA para extrair código numérico real da transação/pedido
export const extractRealTransactionCode = (item: any): string => {
  // PRIORIDADE 1: Código do pedido/order (como 45812, 45811)
  if (item.code && typeof item.code === 'string') {
    // Se for numérico, usar direto
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
  
  // PRIORIDADE 4: Extrair números do ID (para ch_XXXXX extrair parte numérica)
  const idStr = String(item.id || '');
  const numericPart = idStr.replace(/[^0-9]/g, '');
  
  if (numericPart.length >= 4) {
    return numericPart.substring(0, 6);
  }
  
  // Fallback: gerar código sequencial baseado no timestamp
  const timestamp = Date.now();
  return String(timestamp).slice(-5);
};

// Função para extrair TODOS os dados detalhados de uma transação/operação
const extractDetailedData = (item: any, source: string = 'unknown') => {
  // Dados do cartão (aninhados ou diretos)
  const card = item.card || item.last_transaction?.card || {};
  
  // Dados da transação (podem estar aninhados)
  const transaction = item.last_transaction || item.transaction || item;
  
  // Dados do charge (para orders)
  const charge = item.charges?.[0] || item;
  
  return {
    // Dados básicos CORRIGIDOS
    payment_method: item.payment_method || charge.payment_method || transaction.payment_method || 'unknown',
    installments: Number(item.installments) || Number(charge.installments) || Number(transaction.installments) || 1,
    
    // Dados do adquirente
    acquirer_name: item.acquirer_name || charge.acquirer_name || transaction.acquirer_name,
    acquirer_response_code: item.acquirer_response_code || charge.acquirer_response_code || transaction.acquirer_response_code,
    
    // Códigos de autorização
    authorization_code: item.authorization_code || charge.authorization_code || transaction.authorization_code,
    tid: item.tid || charge.tid || transaction.tid,
    nsu: item.nsu || charge.nsu || transaction.nsu,
    
    // Dados do cartão
    card_brand: card.brand || item.card_brand || charge.card_brand || transaction.card_brand,
    card_last_four_digits: card.last_four_digits || item.card_last_four_digits || charge.card_last_four_digits || transaction.card_last_four_digits,
    
    // Dados técnicos
    soft_descriptor: item.soft_descriptor || charge.soft_descriptor || transaction.soft_descriptor,
    gateway_response_time: item.gateway_response_time || charge.gateway_response_time || transaction.gateway_response_time,
    antifraud_score: item.antifraud_score || charge.antifraud_score || transaction.antifraud_score,
    
    // Dados adicionais
    gateway_id: item.gateway_id || charge.gateway_id || transaction.gateway_id,
    reference_key: item.reference_key || charge.reference_key || transaction.reference_key,
    
    // Metadata
    source,
    extracted_at: new Date().toISOString()
  };
};

// Mapear charges para operações com EXTRAÇÃO COMPLETA
export const mapChargesToOperations = (chargesData: any[]): any[] => {
  return chargesData.map((charge: any, index: number) => {
    const customer = charge.customer || {};
    
    // Filtrar apenas PIX e cartão de crédito
    const paymentMethod = charge.payment_method;
    if (!paymentMethod || (paymentMethod !== 'pix' && paymentMethod !== 'credit_card')) {
      return null;
    }
    
    // Extrair TODOS os dados detalhados
    const detailedData = extractDetailedData(charge, 'charge');
    
    return {
      id: String(charge.id || `charge_${index}`),
      type: 'charge',
      status: charge.status || 'unknown',
      // CORREÇÃO: Valores em centavos convertidos para reais
      amount: (Number(charge.amount) || 0) / 100,
      fee: (Number(charge.fee) || 0) / 100,
      created_at: charge.created_at || new Date().toISOString(),
      description: `Cobrança ${extractRealTransactionCode(charge)} - ${paymentMethod === 'pix' ? 'PIX' : 'Cartão de Crédito'}`,
      
      // Dados COMPLETOS extraídos
      ...detailedData,
      
      // Dados específicos do charge
      charge_id: charge.id,
      customer: customer,
      billing: charge.billing,
      real_code: extractRealTransactionCode(charge)
    };
  }).filter(Boolean);
};

// Função removida - agora usamos mapChargesToOperations

// Mapear transações com EXTRAÇÃO COMPLETA
export const mapTransactions = (transactionsData: any[]): any[] => {
  return transactionsData
    .filter((transaction: any) => {
      const paymentMethod = transaction.payment_method;
      return paymentMethod === 'pix' || paymentMethod === 'credit_card';
    })
    .map((transaction: any) => {
      // Extrair TODOS os dados detalhados
      const detailedData = extractDetailedData(transaction, 'transaction');
      
      return {
        id: String(transaction.id),
        // CORREÇÃO: Valores em centavos convertidos para reais
        amount: (Number(transaction.amount) || 0) / 100,
        status: transaction.status || 'unknown',
        payment_method: transaction.payment_method || 'unknown',
        created_at: transaction.created_at || new Date().toISOString(),
        paid_at: transaction.paid_at,
        fee: (Number(transaction.fee) || 0) / 100,
        
        // Dados COMPLETOS extraídos
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
