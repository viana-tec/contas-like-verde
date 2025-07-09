
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { TablesInsert } from '@/integrations/supabase/types';

interface CltEmployeeFormProps {
  onSubmit: (employee: TablesInsert<'clt_employees'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TablesInsert<'clt_employees'>>;
  isOpen: boolean;
}

export const CltEmployeeForm: React.FC<CltEmployeeFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isOpen,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    document: initialData?.document || '',
    position: initialData?.position || '',
    base_salary: initialData?.base_salary || 0,
    advance_payment: initialData?.advance_payment || 0,
    discounts: initialData?.discounts || 0,
    bonuses: initialData?.bonuses || 0,
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    pix_key: initialData?.pix_key || '',
    hire_date: initialData?.hire_date || new Date().toISOString().split('T')[0],
    payment_day_1: initialData?.payment_day_1 || 15,
    payment_day_2: initialData?.payment_day_2 || 30,
    notes: initialData?.notes || '',
    salary_advance: initialData?.salary_advance || 0,
  });

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.document || !formData.position || !formData.base_salary) {
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
        position: formData.position,
        base_salary: Number(formData.base_salary),
        advance_payment: Number(formData.advance_payment) || 0,
        discounts: Number(formData.discounts) || 0,
        bonuses: Number(formData.bonuses) || 0,
        email: formData.email || null,
        phone: formData.phone || null,
        pix_key: formData.pix_key || null,
        hire_date: formData.hire_date,
        payment_day_1: Number(formData.payment_day_1) || 15,
        payment_day_2: Number(formData.payment_day_2) || 30,
        notes: formData.notes || null,
        salary_advance: Number(formData.salary_advance) || 0,
      } as TablesInsert<'clt_employees'>);
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Funcionário CLT' : 'Novo Funcionário CLT'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="document">CPF *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                placeholder="000.000.000-00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="position">Cargo *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="Cargo ou função"
                required
              />
            </div>
            <div>
              <Label htmlFor="hire_date">Data de Contratação *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_salary">Salário Base *</Label>
              <Input
                id="base_salary"
                type="number"
                step="0.01"
                value={formData.base_salary}
                onChange={(e) => setFormData(prev => ({ ...prev, base_salary: Number(e.target.value) }))}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <Label htmlFor="salary_advance">Vale (Adiantamento)</Label>
              <Input
                id="salary_advance"
                type="number"
                step="0.01"
                value={formData.salary_advance}
                onChange={(e) => setFormData(prev => ({ ...prev, salary_advance: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="advance_payment">Adiantamento</Label>
              <Input
                id="advance_payment"
                type="number"
                step="0.01"
                value={formData.advance_payment}
                onChange={(e) => setFormData(prev => ({ ...prev, advance_payment: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="discounts">Descontos</Label>
              <Input
                id="discounts"
                type="number"
                step="0.01"
                value={formData.discounts}
                onChange={(e) => setFormData(prev => ({ ...prev, discounts: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="bonuses">Bônus</Label>
              <Input
                id="bonuses"
                type="number"
                step="0.01"
                value={formData.bonuses}
                onChange={(e) => setFormData(prev => ({ ...prev, bonuses: Number(e.target.value) }))}
                placeholder="0.00"
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
                placeholder="CPF, email ou telefone"
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
