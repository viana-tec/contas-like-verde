
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { TablesInsert } from '@/integrations/supabase/types';

interface AccountPayableFormProps {
  onSubmit: (account: TablesInsert<'accounts_payable'>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TablesInsert<'accounts_payable'> & { has_boleto?: boolean }>;
}

export const AccountPayableForm: React.FC<AccountPayableFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
}) => {
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    supplier: initialData.supplier || '',
    amount: initialData.amount?.toString() || '',
    due_date: initialData.due_date || '',
    category: initialData.category || '',
    status: initialData.status || 'pending',
    notes: initialData.notes || '',
    has_boleto: initialData.has_boleto || false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.supplier || !formData.amount || !formData.due_date) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        description: formData.description,
        supplier: formData.supplier,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        category: formData.category || null,
        status: formData.status,
        notes: formData.notes || null,
      } as TablesInsert<'accounts_payable'>);
      onCancel();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Nome da Conta *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Energia Elétrica - Janeiro"
          required
        />
      </div>

      <div>
        <Label htmlFor="supplier">Fornecedor *</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
          placeholder="Ex: CEMIG"
          required
        />
      </div>

      <div>
        <Label htmlFor="amount">Valor (R$) *</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          placeholder="0,00"
          required
        />
      </div>

      <div>
        <Label htmlFor="due_date">Data de Vencimento *</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Utilidades">Utilidades</SelectItem>
            <SelectItem value="Imóveis">Imóveis</SelectItem>
            <SelectItem value="Suprimentos">Suprimentos</SelectItem>
            <SelectItem value="Serviços">Serviços</SelectItem>
            <SelectItem value="Impostos">Impostos</SelectItem>
            <SelectItem value="Outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">A Vencer</SelectItem>
            <SelectItem value="overdue">Vencida</SelectItem>
            <SelectItem value="paid">Paga</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="has_boleto"
          checked={formData.has_boleto}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_boleto: !!checked }))}
        />
        <Label htmlFor="has_boleto">Possui Boleto</Label>
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Observações adicionais..."
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};
