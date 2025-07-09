
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CltEmployee = Tables<'clt_employees'>;
type CltEmployeeInsert = TablesInsert<'clt_employees'>;
type CltEmployeeUpdate = TablesUpdate<'clt_employees'>;

export const useCltEmployees = () => {
  const [employees, setEmployees] = useState<CltEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clt_employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching CLT employees:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar funcionários CLT',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const addEmployee = async (employee: CltEmployeeInsert): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clt_employees')
        .insert(employee);

      if (error) throw error;

      await fetchEmployees();
      toast({
        title: 'Sucesso',
        description: 'Funcionário CLT adicionado com sucesso',
      });
    } catch (error) {
      console.error('Error adding CLT employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar funcionário CLT',
        variant: 'destructive',
      });
    }
  };

  const updateEmployee = async (id: string, updates: CltEmployeeUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clt_employees')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchEmployees();
      toast({
        title: 'Sucesso',
        description: 'Funcionário CLT atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating CLT employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar funcionário CLT',
        variant: 'destructive',
      });
    }
  };

  const deleteEmployee = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('clt_employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchEmployees();
      toast({
        title: 'Sucesso',
        description: 'Funcionário CLT removido com sucesso',
      });
    } catch (error) {
      console.error('Error deleting CLT employee:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover funcionário CLT',
        variant: 'destructive',
      });
    }
  };

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
  };
};
