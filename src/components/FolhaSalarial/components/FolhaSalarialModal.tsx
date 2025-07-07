import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CLTEmployee, ServiceProvider } from '../types';

interface FolhaSalarialModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'clt' | 'provider';
  editingEmployee: CLTEmployee | null;
  editingProvider: ServiceProvider | null;
  cltFormData: Partial<CLTEmployee>;
  setCltFormData: (data: Partial<CLTEmployee>) => void;
  providerFormData: Partial<ServiceProvider>;
  setProviderFormData: (data: Partial<ServiceProvider>) => void;
  onSaveCLT: () => Promise<boolean>;
  onSaveProvider: () => Promise<boolean>;
}

export const FolhaSalarialModal: React.FC<FolhaSalarialModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  editingEmployee,
  editingProvider,
  cltFormData,
  setCltFormData,
  providerFormData,
  setProviderFormData,
  onSaveCLT,
  onSaveProvider
}) => {
  const handleSave = async () => {
    const success = activeTab === 'clt' ? await onSaveCLT() : await onSaveProvider();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white via-green-50/30 to-white border border-green-200/50 shadow-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-green-700 to-green-900 bg-clip-text text-transparent font-bold text-xl">
            {activeTab === 'clt' 
              ? (editingEmployee ? 'Editar Funcionário CLT' : 'Novo Funcionário CLT')
              : (editingProvider ? 'Editar Prestador de Serviço' : 'Novo Prestador de Serviço')
            }
          </DialogTitle>
        </DialogHeader>
        
        {activeTab === 'clt' ? (
          <div className="space-y-4 p-4 bg-gradient-to-br from-green-50/20 to-transparent rounded-lg border border-green-100/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-green-800 font-medium">Nome *</Label>
                <Input
                  id="name"
                  value={cltFormData.name || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="document" className="text-green-800 font-medium">CPF *</Label>
                <Input
                  id="document"
                  value={cltFormData.document || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position" className="text-green-800 font-medium">Função *</Label>
                <Input
                  id="position"
                  value={cltFormData.position || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, position: e.target.value })}
                  placeholder="Cargo ou função"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="hire_date" className="text-green-800 font-medium">Data de Admissão</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={cltFormData.hire_date || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, hire_date: e.target.value })}
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="base_salary" className="text-green-800 font-medium">Salário Base *</Label>
                <Input
                  id="base_salary"
                  type="number"
                  step="0.01"
                  value={cltFormData.base_salary || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, base_salary: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="salary_advance" className="text-green-800 font-medium">Vale (Adiantamento)</Label>
                <Input
                  id="salary_advance"
                  type="number"
                  step="0.01"
                  value={cltFormData.salary_advance || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, salary_advance: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-green-800 font-medium">Status</Label>
                <select
                  id="status"
                  value={cltFormData.status || 'active'}
                  onChange={(e) => setCltFormData({ ...cltFormData, status: e.target.value })}
                  className="w-full p-2 border rounded bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_day_1" className="text-green-800 font-medium">1º Pagamento (Dia)</Label>
                <Input
                  id="payment_day_1"
                  type="number"
                  min="1"
                  max="31"
                  value={cltFormData.payment_day_1 || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, payment_day_1: parseInt(e.target.value) })}
                  placeholder="15"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="payment_day_2" className="text-green-800 font-medium">2º Pagamento (Dia)</Label>
                <Input
                  id="payment_day_2"
                  type="number"
                  min="1"
                  max="31"
                  value={cltFormData.payment_day_2 || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, payment_day_2: parseInt(e.target.value) })}
                  placeholder="30"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email" className="text-green-800 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cltFormData.email || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-green-800 font-medium">Telefone</Label>
                <Input
                  id="phone"
                  value={cltFormData.phone || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="pix_key" className="text-green-800 font-medium">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={cltFormData.pix_key || ''}
                  onChange={(e) => setCltFormData({ ...cltFormData, pix_key: e.target.value })}
                  placeholder="CPF, email, telefone..."
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} className="border-green-200 text-green-700 hover:bg-green-50">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#39FF14] to-green-400 text-black hover:from-[#39FF14]/90 hover:to-green-400/90 shadow-lg"
              >
                {editingEmployee ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-gradient-to-br from-green-50/20 to-transparent rounded-lg border border-green-100/30">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider_name" className="text-green-800 font-medium">Nome *</Label>
                <Input
                  id="provider_name"
                  value={providerFormData.name || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="provider_document" className="text-green-800 font-medium">CPF/CNPJ *</Label>
                <Input
                  id="provider_document"
                  value={providerFormData.document || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_type" className="text-green-800 font-medium">Tipo de Serviço *</Label>
                <Input
                  id="service_type"
                  value={providerFormData.service_type || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, service_type: e.target.value })}
                  placeholder="Ex: Consultoria, Desenvolvimento..."
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="monthly_amount" className="text-green-800 font-medium">Valor Mensal *</Label>
                <Input
                  id="monthly_amount"
                  type="number"
                  step="0.01"
                  value={providerFormData.monthly_amount || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, monthly_amount: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider_payment_day_1" className="text-green-800 font-medium">1º Pagamento (Dia)</Label>
                <Input
                  id="provider_payment_day_1"
                  type="number"
                  min="1"
                  max="31"
                  value={providerFormData.payment_day_1 || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, payment_day_1: parseInt(e.target.value) })}
                  placeholder="15"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="provider_payment_day_2" className="text-green-800 font-medium">2º Pagamento (Dia)</Label>
                <Input
                  id="provider_payment_day_2"
                  type="number"
                  min="1"
                  max="31"
                  value={providerFormData.payment_day_2 || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, payment_day_2: parseInt(e.target.value) })}
                  placeholder="30"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="provider_email" className="text-green-800 font-medium">Email</Label>
                <Input
                  id="provider_email"
                  type="email"
                  value={providerFormData.email || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="provider_phone" className="text-green-800 font-medium">Telefone</Label>
                <Input
                  id="provider_phone"
                  value={providerFormData.phone || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
              <div>
                <Label htmlFor="provider_pix_key" className="text-green-800 font-medium">Chave PIX</Label>
                <Input
                  id="provider_pix_key"
                  value={providerFormData.pix_key || ''}
                  onChange={(e) => setProviderFormData({ ...providerFormData, pix_key: e.target.value })}
                  placeholder="CPF, email, telefone..."
                  className="bg-gradient-to-r from-white to-green-50/30 border-green-200/50 focus:border-green-400"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose} className="border-green-200 text-green-700 hover:bg-green-50">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-gradient-to-r from-[#39FF14] to-green-400 text-black hover:from-[#39FF14]/90 hover:to-green-400/90 shadow-lg"
              >
                {editingProvider ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
