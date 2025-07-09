
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
    waiting_funds: { label: 'Recebível Futuro', variant: 'secondary' }, // Atualizado
    transferred: { label: 'Transferido', variant: 'outline' },
    refunded: { label: 'Estornado', variant: 'destructive' },
    authorized: { label: 'Autorizado/Pago', variant: 'default' }, // Adicionado
  };

  const statusInfo = statusMap[status] || { label: status, variant: 'outline' };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};
