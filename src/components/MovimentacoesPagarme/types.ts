
export interface BalanceOperation {
  id: string;
  type: string;
  status: string;
  amount: number;
  fee?: number;
  created_at: string;
  description?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  paid_at?: string;
  boleto?: {
    line: string;
    pdf: string;
  };
  pix?: {
    qr_code: string;
  };
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';
