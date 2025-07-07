
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CLTEmployee, ServiceProvider } from '../types';

export const useFolhaSalarialData = () => {
  const [cltEmployees, setCltEmployees] = useState<CLTEmployee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<CLTEmployee | null>(null);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [cltFormData, setCltFormData] = useState<Partial<CLTEmployee>>({});
  const [providerFormData, setProviderFormData] = useState<Partial<ServiceProvider>>({});
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [cltResponse, providersResponse] = await Promise.all([
        supabase.from('clt_employees').select('*').order('name'),
        supabase.from('service_providers').select('*').order('name')
      ]);

      if (cltResponse.error) throw cltResponse.error;
      if (providersResponse.error) throw providersResponse.error;

      setCltEmployees(cltResponse.data || []);
      setServiceProviders(providersResponse.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da folha salarial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCLTEmployee = async () => {
    if (!cltFormData.name || !cltFormData.document || !cltFormData.position || !cltFormData.base_salary) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const employeeData = {
        name: cltFormData.name,
        document: cltFormData.document,
        position: cltFormData.position,
        base_salary: Number(cltFormData.base_salary),
        hire_date: cltFormData.hire_date || new Date().toISOString().split('T')[0],
        salary_advance: Number(cltFormData.salary_advance || 0),
        payment_day_1: cltFormData.payment_day_1 || 15,
        payment_day_2: cltFormData.payment_day_2 || 30,
        status: cltFormData.status || 'active',
        email: cltFormData.email || null,
        phone: cltFormData.phone || null,
        pix_key: cltFormData.pix_key || null
      };

      if (editingEmployee) {
        const { error } = await supabase
          .from('clt_employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Funcionário CLT atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('clt_employees')
          .insert([employeeData]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Funcionário CLT adicionado com sucesso!" });
      }

      resetForms();
      fetchData();
      return true;
    } catch (error) {
      console.error('Erro ao salvar funcionário CLT:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar funcionário CLT",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveServiceProvider = async () => {
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

      resetForms();
      fetchData();
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

  const deleteCLTEmployee = async (id: string) => {
    try {
      const { error } = await supabase.from('clt_employees').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Funcionário CLT removido com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar funcionário CLT:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário CLT",
        variant: "destructive"
      });
    }
  };

  const deleteServiceProvider = async (id: string) => {
    try {
      const { error } = await supabase.from('service_providers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Prestador de serviço removido com sucesso!" });
      fetchData();
    } catch (error) {
      console.error('Erro ao deletar prestador:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover prestador de serviço",
        variant: "destructive"
      });
    }
  };

  const resetForms = () => {
    setCltFormData({});
    setProviderFormData({});
    setEditingEmployee(null);
    setEditingProvider(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    // Data
    employees: cltEmployees,
    providers: serviceProviders,
    loading,
    
    // Editing states
    editingEmployee,
    editingProvider,
    setEditingEmployee,
    setEditingProvider,
    
    // Form data
    cltFormData,
    setCltFormData,
    providerFormData,
    setProviderFormData,
    
    // Actions
    saveCLTEmployee,
    saveServiceProvider,
    deleteCLTEmployee,
    deleteServiceProvider,
    resetForms,
    refetchData: fetchData
  };
};
