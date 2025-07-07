
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CLTEmployee } from '../types';

export const useCLTEmployees = (refetchData: () => void) => {
  const [editingEmployee, setEditingEmployee] = useState<CLTEmployee | null>(null);
  const [cltFormData, setCltFormData] = useState<Partial<CLTEmployee>>({});
  const { toast } = useToast();

  const handleSaveCLT = async () => {
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

      setCltFormData({});
      setEditingEmployee(null);
      refetchData();
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

  const handleDeleteCLT = async (id: string) => {
    try {
      const { error } = await supabase.from('clt_employees').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Sucesso", description: "Funcionário CLT removido com sucesso!" });
      refetchData();
    } catch (error) {
      console.error('Erro ao deletar funcionário CLT:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover funcionário CLT",
        variant: "destructive"
      });
    }
  };

  return {
    editingEmployee,
    setEditingEmployee,
    cltFormData,
    setCltFormData,
    handleSaveCLT,
    handleDeleteCLT
  };
};
