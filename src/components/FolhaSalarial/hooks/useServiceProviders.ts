
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ServiceProvider } from '../types';

export const useServiceProviders = (refetchData: () => void) => {
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [providerFormData, setProviderFormData] = useState<Partial<ServiceProvider>>({});
  const { toast } = useToast();

  const handleSaveProvider = async () => {
    if (!providerFormData.name || !providerFormData.document || !providerFormData.service_type || !providerFormData.monthly_amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const providerData = {
        name: providerFormData.name,
        document: providerFormData.document,
        service_type: providerFormData.service_type,
        monthly_amount: Number(providerFormData.monthly_amount),
        payment_day_1: providerFormData.payment_day_1 || 15,
        payment_day_2: providerFormData.payment_day_2 || 30,
        status: providerFormData.status || 'active',
        email: providerFormData.email || null,
        phone: providerFormData.phone || null,
        pix_key: providerFormData.pix_key || null
      };

      if (editingProvider) {
        const { error } = await supabase
          .from('service_providers')
          .update(providerData)
          .eq('id', editingProvider.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Prestador de serviço atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert([providerData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Prestador de serviço adicionado com sucesso!" });
      }

      setProviderFormData({});
      setEditingProvider(null);
      refetchData();
      return true;
    } catch (error) {
      console.error('Erro ao salvar prestador:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar prestador de serviço",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      const { error } = await supabase.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Prestador de serviço removido com sucesso!" });
      refetchData();
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover prestador de serviço",
        variant: "destructive"
      });
    }
  };

  return {
    editingProvider,
    setEditingProvider,
    providerFormData,
    setProviderFormData,
    handleSaveProvider,
    handleDeleteProvider
  };
};
