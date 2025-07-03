
import React from 'react';
import { CreditCard, FileText, Smartphone, AlertCircle } from 'lucide-react';

interface PaymentMethodIconProps {
  method: string;
}

export const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({ method }) => {
  switch (method) {
    case 'credit_card':
    case 'debit_card':
      return <CreditCard size={16} />;
    case 'boleto':
      return <FileText size={16} />;
    case 'pix':
      return <Smartphone size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
};
