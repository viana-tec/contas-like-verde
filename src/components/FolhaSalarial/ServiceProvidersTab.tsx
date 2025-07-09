import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PixKeyCell } from './PixKeyCell';
import type { Tables } from '@/integrations/supabase/types';
interface ServiceProvidersTabProps {
  providers: Tables<'service_providers'>[];
  handleOpenProviderModal: (provider?: Tables<'service_providers'>) => void;
  handleDeleteProvider: (id: string) => void;
  formatCurrency: (value: number) => string;
  filteredProviders: Tables<'service_providers'>[];
}
export const ServiceProvidersTab: React.FC<ServiceProvidersTabProps> = ({
  providers,
  handleOpenProviderModal,
  handleDeleteProvider,
  formatCurrency,
  filteredProviders
}) => {
  return <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenProviderModal()} className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Prestador de Serviços
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white font-bold">Nome</TableHead>
              <TableHead className="text-white font-bold">Tipo de Serviço</TableHead>
              <TableHead className="text-white font-bold">Valor Mensal</TableHead>
              <TableHead className="text-white font-bold">Dia Pagamento</TableHead>
              <TableHead className="text-white font-bold">Chave PIX</TableHead>
              <TableHead className="text-white font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.map(provider => <TableRow key={provider.id}>
                <TableCell className="font-bold text-white">{provider.name}</TableCell>
                <TableCell className="text-white font-bold">{provider.service_type}</TableCell>
                <TableCell className="text-[#39FF14] font-bold">
                  {formatCurrency(provider.monthly_amount)}
                </TableCell>
                <TableCell className="text-white font-bold">Dia {provider.payment_date}</TableCell>
                <TableCell className="text-white font-bold">
                  {provider.pix_key && <PixKeyCell pixKey={provider.pix_key} />}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenProviderModal(provider)} className="text-slate-50">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteProvider(provider.id)} className="text-slate-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </Card>
    </div>;
};