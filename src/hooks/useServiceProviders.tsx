
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ServiceProvider = Tables<'service_providers'>;
type ServiceProviderInsert = TablesInsert<'service_providers'>;
type ServiceProviderUpdate = TablesUpdate<'service_providers'>;

export const useServiceProviders = () => {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching service providers:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar prestadores de serviços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const addProvider = async (provider: ServiceProviderInsert): Promise<void> => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .insert(provider);

      if (error) throw error;

      await fetchProviders();
      toast({
        title: 'Sucesso',
        description: 'Prestador de serviços adicionado com sucesso',
      });
    } catch (error) {
      console.error('Error adding service provider:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar prestador de serviços',
        variant: 'destructive',
      });
    }
  };

  const updateProvider = async (id: string, updates: ServiceProviderUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchProviders();
      toast({
        title: 'Sucesso',
        description: 'Prestador de serviços atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating service provider:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar prestador de serviços',
        variant: 'destructive',
      });
    }
  };

  const deleteProvider = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProviders();
      toast({
        title: 'Sucesso',
        description: 'Prestador de serviços removido com sucesso',
      });
    } catch (error) {
      console.error('Error deleting service provider:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover prestador de serviços',
        variant: 'destructive',
      });
    }
  };

  return {
    providers,
    loading,
    addProvider,
    updateProvider,
    deleteProvider,
    refetch: fetchProviders,
  };
};
