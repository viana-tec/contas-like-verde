
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type AccountPayable = Tables<'accounts_payable'> & { has_boleto?: boolean };
type AccountPayableInsert = TablesInsert<'accounts_payable'>;
type AccountPayableUpdate = TablesUpdate<'accounts_payable'>;

export const useAccountsPayable = () => {
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar contas a pagar',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addAccount = async (account: AccountPayableInsert): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert(account)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => [...prev, data]);
      toast({
        title: 'Sucesso',
        description: 'Conta adicionada com sucesso',
      });
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAccount = async (id: string, updates: AccountPayableUpdate): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('accounts_payable')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAccounts(prev => prev.map(acc => acc.id === id ? data : acc));
      toast({
        title: 'Sucesso',
        description: 'Conta atualizada com sucesso',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAccount = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Conta removida com sucesso',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover conta',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return {
    accounts,
    loading,
    addAccount,
    updateAccount,
    deleteAccount,
    refetch: fetchAccounts,
  };
};
