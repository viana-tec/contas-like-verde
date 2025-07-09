
-- Criar tabela para contas a pagar se não existir
CREATE TABLE IF NOT EXISTS public.accounts_payable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description TEXT NOT NULL,
  supplier TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  has_boleto BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados gerenciarem contas a pagar
CREATE POLICY "Authenticated users can manage accounts payable" 
ON public.accounts_payable 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Inserir dados de exemplo (mantendo os existentes)
INSERT INTO public.accounts_payable (description, supplier, amount, due_date, category, status, has_boleto) VALUES
('Energia Elétrica - Dezembro', 'CEMIG', 1250.00, '2024-12-20', 'Utilidades', 'pending', true),
('Aluguel do Escritório', 'Imobiliária Santos', 3500.00, '2024-12-15', 'Imóveis', 'overdue', true),
('Material de Escritório', 'Papelaria Central', 450.00, '2024-12-25', 'Suprimentos', 'pending', false)
ON CONFLICT DO NOTHING;

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accounts_payable_updated_at 
BEFORE UPDATE ON public.accounts_payable 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
