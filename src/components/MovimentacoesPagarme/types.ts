
export interface BalanceOperation {
  id: string;
  type: string;
  status: string;
  amount: number;
  fee?: number;
  created_at: string;
  updated_at?: string;
  description?: string;
  // Campos expandidos
  payment_method?: string;
  installments?: number;
  acquirer_name?: string;
  acquirer_response_code?: string;
  authorization_code?: string;
  tid?: string;
  nsu?: string;
  card_brand?: string;
  card_last_four_digits?: string;
  soft_descriptor?: string;
  gateway_response_time?: number;
  antifraud_score?: number;
  // Campos adicionais para códigos reais
  real_code?: string;
  reference_key?: string;
  order_id?: string;
  transaction_id?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at?: string;
  fee?: number; // Adicionado campo fee
  // Campos expandidos
  installments?: number;
  acquirer_name?: string;
  acquirer_response_code?: string;
  authorization_code?: string;
  tid?: string;
  nsu?: string;
  card_brand?: string;
  card_last_four_digits?: string;
  soft_descriptor?: string;
  gateway_response_time?: number;
  antifraud_score?: number;
  reference_key?: string;
  customer?: {
    name?: string;
    email?: string;
    document?: string;
  };
  billing?: {
    name?: string;
    address?: {
      street?: string;
      number?: string;
      city?: string;
      state?: string;
      zip_code?: string;
    };
  };
  boleto?: {
    line: string;
    pdf: string;
    due_at?: string;
    instructions?: string;
  };
  pix?: {
    qr_code: string;
    qr_code_url?: string;
    expires_at?: string;
  };
  // Campos adicionais para códigos reais
  real_code?: string;
  order_id?: string;
}

export interface FilterOptions {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  paymentMethods: string[];
  statuses: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchTerm: string;
  acquirer: string;
  cardBrand: string;
}

export interface FinancialIndicators {
  totalRevenue: number;
  totalFees: number;
  netRevenue: number;
  totalTransactions: number;
  averageTicket: number;
  approvalRate: number;
  refundRate: number;
  pixPercentage: number;
  creditCardPercentage: number;
  debitCardPercentage: number;
  boletoPercentage: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingAmount: number;
  availableAmount: number;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
