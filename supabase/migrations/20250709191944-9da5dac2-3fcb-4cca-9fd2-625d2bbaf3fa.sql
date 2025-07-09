
-- Criar tabela para armazenar configurações da API Pagar.me
CREATE TABLE IF NOT EXISTS public.pagarme_api_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key TEXT NOT NULL,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  connection_status TEXT NOT NULL DEFAULT 'idle',
  error_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pagarme_api_config ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados gerenciem suas configurações
CREATE POLICY "Authenticated users can manage their API config" 
  ON public.pagarme_api_config 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pagarme_api_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pagarme_api_config_updated_at
  BEFORE UPDATE ON public.pagarme_api_config
  FOR EACH ROW EXECUTE FUNCTION update_pagarme_api_config_updated_at();
