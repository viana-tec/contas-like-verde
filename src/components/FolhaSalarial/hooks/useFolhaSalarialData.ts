
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CLTEmployee, ServiceProvider } from '../types';

export const useFolhaSalarialData = () => {
  const [cltEmployees, setCltEmployees] = useState<CLTEmployee[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchData();
  }, []);

  return {
    cltEmployees,
    serviceProviders,
    loading,
    refetchData: fetchData
  };
};
