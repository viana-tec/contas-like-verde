
import React from 'react';
import { Plus, Edit3, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ServiceProvider } from '../types';

interface ServiceProvidersTabProps {
  providers: ServiceProvider[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenModal: (provider?: ServiceProvider) => void;
  onDeleteProvider: (id: string) => void;
  onCopyPix: (pixKey: string) => void;
  formatCurrency: (value: number) => string;
}

export const ServiceProvidersTab: React.FC<ServiceProvidersTabProps> = ({
  providers,
  searchTerm,
  setSearchTerm,
  onOpenModal,
  onDeleteProvider,
  onCopyPix,
  formatCurrency
}) => {
  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <Input
            placeholder="Buscar prestador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
          />
          <Card className="p-3 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 border-green-700/30 shadow-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-[#39FF14]">{providers.length}</div>
              <div className="text-xs text-gray-400">Prestadores</div>
            </div>
          </Card>
          <Card className="p-3 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900 border-green-700/30 shadow-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-[#39FF14]">
                {formatCurrency(providers.reduce((sum, p) => sum + p.monthly_amount, 0))}
              </div>
              <div className="text-xs text-gray-400">Total Prestadores</div>
            </div>
          </Card>
        </div>
        <Button 
          onClick={() => onOpenModal()}
          className="bg-gradient-to-r from-[#39FF14] to-green-400 text-black hover:from-[#39FF14]/90 hover:to-green-400/90 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Prestador
        </Button>
      </div>

      <Card className="bg-gradient-to-br from-gray-900 via-green-900/10 to-gray-900 border-green-800/30 shadow-xl backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-green-800/50">
              <TableHead className="text-white font-bold">Nome</TableHead>
              <TableHead className="text-white font-bold">Tipo de Serviço</TableHead>
              <TableHead className="text-white font-bold">Valor Mensal</TableHead>
              <TableHead className="text-white font-bold">1º Pagamento</TableHead>
              <TableHead className="text-white font-bold">2º Pagamento</TableHead>
              <TableHead className="text-white font-bold">Chave PIX</TableHead>
              <TableHead className="text-white font-bold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProviders.map((provider) => (
              <TableRow key={provider.id} className="border-green-800/30 hover:bg-gradient-to-r hover:from-green-900/20 hover:to-transparent transition-all duration-300">
                <TableCell className="font-medium text-white font-bold">{provider.name}</TableCell>
                <TableCell className="text-white font-bold">{provider.service_type}</TableCell>
                <TableCell className="text-[#39FF14] font-bold bg-gradient-to-r from-transparent to-green-900/20 rounded">
                  {formatCurrency(provider.monthly_amount)}
                </TableCell>
                <TableCell className="text-white font-bold">Dia {provider.payment_day_1}</TableCell>
                <TableCell className="text-white font-bold">Dia {provider.payment_day_2}</TableCell>
                <TableCell className="text-white font-bold">
                  {provider.pix_key && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{provider.pix_key}</span>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => onCopyPix(provider.pix_key!)}
                        className="p-1 h-auto hover:bg-green-800/30"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onOpenModal(provider)}
                      className="hover:bg-green-800/30"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onDeleteProvider(provider.id)}
                      className="hover:bg-red-800/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
