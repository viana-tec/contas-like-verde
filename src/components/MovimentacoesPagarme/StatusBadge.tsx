
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusMap: Record<string, { label: string; variant: any }> = {
    paid: { label: 'Pago', variant: 'default' },
    processing: { label: 'Processando', variant: 'secondary' },
    refused: { label: 'Recusado', variant: 'destructive' },
    pending: { label: 'Pendente', variant: 'outline' },
    available: { label: 'Disponível', variant: 'default' },
    waiting_funds: { label: 'Aguardando', variant: 'secondary' },
    transferred: { label: 'Transferido', variant: 'outline' },
    refunded: { label: 'Estornado', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};
