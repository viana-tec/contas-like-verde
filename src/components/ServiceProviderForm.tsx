
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';

interface ServiceProviderFormProps {
  onSubmit: (provider: TablesInsert<'service_providers'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TablesInsert<'service_providers'>>;
  isOpen: boolean;
}

export const ServiceProviderForm: React.FC<ServiceProviderFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    document: initialData?.document || '',
    service_type: initialData?.service_type || '',
    monthly_amount: initialData?.monthly_amount || 0,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    pix_key: initialData?.pix_key || '',
    payment_date: initialData?.payment_date || 5,
    payment_day_1: initialData?.payment_day_1 || 15,
    payment_day_2: initialData?.payment_day_2 || 30,
    notes: initialData?.notes || '',
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document || !formData.service_type || !formData.monthly_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        document: formData.document,
        service_type: formData.service_type,
        monthly_amount: Number(formData.monthly_amount),
        email: formData.email || null,
        phone: formData.phone || null,
        pix_key: formData.pix_key || null,
        payment_date: Number(formData.payment_date) || 5,
        payment_day_1: Number(formData.payment_day_1) || 15,
        payment_day_2: Number(formData.payment_day_2) || 30,
        notes: formData.notes || null,
      } as TablesInsert<'service_providers'>);
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Prestador de Serviços' : 'Novo Prestador de Serviços'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome/Razão Social *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome ou razão social"
                required
              />
            </div>
            <div>
              <Label htmlFor="document">CPF/CNPJ *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service_type">Tipo de Serviço *</Label>
              <Input
                id="service_type"
                value={formData.service_type}
                onChange={(e) => setFormData(prev => ({ ...prev, service_type: e.target.value }))}
                placeholder="Tipo de serviço prestado"
                required
              />
            </div>
            <div>
              <Label htmlFor="monthly_amount">Valor Mensal *</Label>
              <Input
                id="monthly_amount"
                type="number"
                step="0.01"
                value={formData.monthly_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, monthly_amount: Number(e.target.value) }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pix_key">Chave PIX</Label>
              <Input
                id="pix_key"
                value={formData.pix_key}
                onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                placeholder="CPF/CNPJ, email ou telefone"
              />
            </div>
            <div>
              <Label htmlFor="payment_day_1">1º Pagamento</Label>
              <Input
                id="payment_day_1"
                type="number"
                min="1"
                max="31"
                value={formData.payment_day_1}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_day_1: Number(e.target.value) }))}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="payment_day_2">2º Pagamento</Label>
              <Input
                id="payment_day_2"
                type="number"
                min="1"
                max="31"
                value={formData.payment_day_2}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_day_2: Number(e.target.value) }))}
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="bg-[#39FF14] text-black hover:bg-[#39FF14]/90"
            >
              {initialData ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
