
import { BalanceOperation, Transaction } from './types';

export const getMockOperations = (): BalanceOperation[] => [
  {
    id: 'op_clm123456789',
    type: 'payable',
    status: 'paid',
    amount: 15000,
    fee: 450,
    created_at: new Date().toISOString(),
    description: 'Pagamento de cartão de crédito'
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
    description: 'Estorno de pagamento'
  },
  {
    id: 'op_clm111222333',
    type: 'payable',
    status: 'waiting_funds',
    amount: 12000,
    fee: 360,
    created_at: new Date(Date.now() - 345600000).toISOString(),
    description: 'Pagamento PIX pendente'
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
