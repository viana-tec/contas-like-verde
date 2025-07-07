
import { BalanceOperation, Transaction } from './types';

export const getMockOperations = (): BalanceOperation[] => [
  {
    id: 'op_clm123456789',
    type: 'payable',
    status: 'paid',
    amount: 15000,
    fee: 450,
    created_at: new Date().toISOString(),
    description: 'Pagamento de cartão de crédito',
    payment_method: 'credit_card',
    authorization_code: '45775',
    tid: '45775001',
    nsu: '12345',
    card_brand: 'visa',
    card_last_four_digits: '1234',
    acquirer_name: 'cielo',
    installments: 1,
    gateway_response_time: 250,
    antifraud_score: 85
  },
  {
    id: 'op_clm987654321',
    type: 'transfer',
    status: 'transferred',
    amount: 8500,
    fee: 0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    description: 'Transferência para conta bancária'
  },
  {
    id: 'op_clm555666777',
    type: 'fee_collection',
    status: 'available',
    amount: -450,
    fee: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    description: 'Taxa de processamento'
  },
  {
    id: 'op_clm444333222',
    type: 'refund',
    status: 'refunded',
    amount: -2500,
    fee: 0,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    description: 'Estorno de pagamento',
    payment_method: 'credit_card',
    authorization_code: '99887',
    card_brand: 'mastercard',
    acquirer_name: 'stone'
  },
  {
    id: 'op_clm111222333',
    type: 'payable',
    status: 'waiting_funds',
    amount: 12000,
    fee: 360,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    description: 'Pagamento PIX pendente',
    payment_method: 'pix',
    authorization_code: '77432',
    gateway_response_time: 150
  },
  {
    id: 'op_clm777888999',
    type: 'payable',
    status: 'paid',
    amount: 8500,
    fee: 255,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    description: 'Pagamento boleto',
    payment_method: 'boleto',
    authorization_code: '33445'
  },
  {
    id: 'op_clm999000111',
    type: 'payable',
    status: 'paid',
    amount: 22000,
    fee: 660,
    created_at: new Date(Date.now() - 518400000).toISOString(),
    description: 'Pagamento cartão débito',
    payment_method: 'debit_card',
    authorization_code: '66778',
    tid: '66778002',
    nsu: '67890',
    card_brand: 'elo',
    card_last_four_digits: '5678',
    acquirer_name: 'rede',
    gateway_response_time: 180,
    antifraud_score: 92
  },
  {
    id: 'op_clm222333444',
    type: 'payable',
    status: 'processing',
    amount: 5500,
    fee: 165,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    description: 'Pagamento processando',
    payment_method: 'credit_card',
    authorization_code: '11223',
    card_brand: 'amex',
    acquirer_name: 'bin',
    installments: 3
  },
  {
    id: 'op_clm555777999',
    type: 'payable',
    status: 'refused',
    amount: 0,
    fee: 0,
    created_at: new Date(Date.now() - 691200000).toISOString(),
    description: 'Pagamento recusado',
    payment_method: 'credit_card',
    authorization_code: '00000',
    card_brand: 'visa',
    acquirer_name: 'cielo',
    acquirer_response_code: '57'
  }
];

export const getMockTransactions = (): Transaction[] => [
  {
    id: 'tran_abc123456789',
    amount: 15000,
    status: 'paid',
    payment_method: 'credit_card',
    created_at: new Date().toISOString(),
    paid_at: new Date().toISOString()
  },
  {
    id: 'tran_def987654321',
    amount: 12000,
    status: 'processing',
    payment_method: 'pix',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    pix: {
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
  },
  {
    id: 'tran_ghi555666777',
    amount: 8500,
    status: 'paid',
    payment_method: 'boleto',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    paid_at: new Date(Date.now() - 86400000).toISOString(),
    boleto: {
      line: '34191.79001 01043.510047 91020.150008 1 84560000002000',
      pdf: 'https://api.pagar.me/core/v5/transactions/tran_ghi555666777/boleto'
    }
  },
  {
    id: 'tran_jkl444333222',
    amount: 2500,
    status: 'refused',
    payment_method: 'credit_card',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'tran_mno111222333',
    amount: 7800,
    status: 'paid',
    payment_method: 'debit_card',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    paid_at: new Date(Date.now() - 259200000).toISOString()
  }
];
