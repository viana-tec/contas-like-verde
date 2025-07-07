
import { BalanceOperation, Transaction } from './types';

export const getMockOperations = (): BalanceOperation[] => [
  {
    id: 'ch_w0eN4Ras7s3qdpz7',
    type: 'payable',
    status: 'paid',
    amount: 150.00,
    fee: 4.50,
    created_at: new Date().toISOString(),
    description: 'Pagamento de cartão de crédito',
    payment_method: 'credit_card',
    authorization_code: '45907',
    tid: '45907001',
    nsu: '12345',
    card_brand: 'visa',
    card_last_four_digits: '1234',
    acquirer_name: 'cielo',
    installments: 3,
    gateway_response_time: 250,
    antifraud_score: 85,
    real_code: '45907'
  },
  {
    id: 'ch_BxY2mN8pQ4rVfK9L',
    type: 'payable',
    status: 'paid',
    amount: 85.00,
    fee: 2.55,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    description: 'Pagamento PIX',
    payment_method: 'pix',
    authorization_code: '38291',
    real_code: '38291',
    installments: 1
  },
  {
    id: 'ch_7zF5pQ3mR8kN2tX6',
    type: 'fee_collection',
    status: 'available',
    amount: -4.50,
    fee: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    description: 'Taxa de processamento',
    real_code: '50428'
  },
  {
    id: 'ch_K9mP4dR7jS2nQ8bX',
    type: 'refund',
    status: 'refunded',
    amount: -25.00,
    fee: 0,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    description: 'Estorno de pagamento',
    payment_method: 'credit_card',
    authorization_code: '99887',
    card_brand: 'mastercard',
    acquirer_name: 'stone',
    real_code: '99887',
    installments: 2
  },
  {
    id: 'ch_M3nK8pL4qR9jT5xZ',
    type: 'payable',
    status: 'waiting_funds',
    amount: 120.00,
    fee: 3.60,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    description: 'Pagamento PIX pendente',
    payment_method: 'pix',
    authorization_code: '77432',
    gateway_response_time: 150,
    real_code: '77432',
    installments: 1
  },
  {
    id: 'ch_V8bN5kM2pQ4rF7jL',
    type: 'payable',
    status: 'paid',
    amount: 185.00,
    fee: 5.55,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    description: 'Pagamento cartão parcelado',
    payment_method: 'credit_card',
    authorization_code: '63445',
    card_brand: 'mastercard',
    acquirer_name: 'rede',
    installments: 6,
    real_code: '63445'
  },
  {
    id: 'ch_Q2nR9mP3kL7fX5bT',
    type: 'payable',
    status: 'paid',
    amount: 220.00,
    fee: 6.60,
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
    antifraud_score: 92,
    installments: 1,
    real_code: '66778'
  },
  {
    id: 'ch_J4kP7nR2mQ5xF9bL',
    type: 'payable',
    status: 'processing',
    amount: 55.00,
    fee: 1.65,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    description: 'Pagamento processando',
    payment_method: 'credit_card',
    authorization_code: '11223',
    card_brand: 'amex',
    acquirer_name: 'bin',
    installments: 12,
    real_code: '11223'
  },
  {
    id: 'ch_T8nQ5kL3pR7jF2mX',
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
    acquirer_response_code: '57',
    real_code: '00000',
    installments: 1
  }
];

export const getMockTransactions = (): Transaction[] => [
  {
    id: 'tran_abc123456789',
    amount: 150.00,
    status: 'paid',
    payment_method: 'credit_card',
    created_at: new Date().toISOString(),
    paid_at: new Date().toISOString(),
    fee: 4.50
  },
  {
    id: 'tran_def987654321',
    amount: 120.00,
    status: 'processing',
    payment_method: 'pix',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    fee: 3.60,
    pix: {
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
  },
  {
    id: 'tran_ghi555666777',
    amount: 85.00,
    status: 'paid',
    payment_method: 'boleto',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    paid_at: new Date(Date.now() - 86400000).toISOString(),
    fee: 2.55,
    boleto: {
      line: '34191.79001 01043.510047 91020.150008 1 84560000002000',
      pdf: 'https://api.pagar.me/core/v5/transactions/tran_ghi555666777/boleto'
    }
  },
  {
    id: 'tran_jkl444333222',
    amount: 25.00,
    status: 'refused',
    payment_method: 'credit_card',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    fee: 0
  },
  {
    id: 'tran_mno111222333',
    amount: 78.00,
    status: 'paid',
    payment_method: 'debit_card',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    paid_at: new Date(Date.now() - 259200000).toISOString(),
    fee: 2.34
  }
];
