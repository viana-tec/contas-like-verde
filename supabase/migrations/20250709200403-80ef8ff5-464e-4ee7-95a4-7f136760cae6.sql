
-- Criar tabela para funcionários CLT
CREATE TABLE IF NOT EXISTS public.clt_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  position TEXT NOT NULL,
  base_salary NUMERIC NOT NULL,
  advance_payment NUMERIC DEFAULT 0,
  discounts NUMERIC DEFAULT 0,
  bonuses NUMERIC DEFAULT 0,
  email TEXT,
  phone TEXT,
  pix_key TEXT,
  hire_date DATE NOT NULL,
  payment_day_1 INTEGER DEFAULT 15,
  payment_day_2 INTEGER DEFAULT 30,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  salary_advance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela para prestadores de serviços
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  service_type TEXT NOT NULL,
  monthly_amount NUMERIC NOT NULL,
  email TEXT,
  phone TEXT,
  pix_key TEXT,
  payment_date INTEGER DEFAULT 5,
  payment_day_1 INTEGER DEFAULT 15,
  payment_day_2 INTEGER DEFAULT 30,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.clt_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

-- Políticas para funcionários CLT
CREATE POLICY "Authenticated users can manage CLT employees" 
ON public.clt_employees 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Políticas para prestadores de serviços
CREATE POLICY "Authenticated users can manage service providers" 
ON public.service_providers 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Inserir dados de exemplo para funcionários CLT
INSERT INTO public.clt_employees (name, document, position, base_salary, advance_payment, discounts, bonuses, email, phone, pix_key, hire_date, payment_day_1, payment_day_2, notes) VALUES
('João Silva', '123.456.789-10', 'Desenvolvedor Sênior', 8500.00, 1000.00, 200.00, 500.00, 'joao.silva@email.com', '(11) 99999-9999', 'joao.silva@email.com', '2024-01-15', 15, 30, 'Funcionário dedicado'),
('Maria Santos', '987.654.321-00', 'Gerente Financeiro', 12000.00, 1500.00, 0.00, 800.00, 'maria.santos@email.com', '(11) 88888-8888', '+5511999999999', '2024-01-20', 10, 25, 'Excelente performance')
ON CONFLICT DO NOTHING;

-- Inserir dados de exemplo para prestadores de serviços
INSERT INTO public.service_providers (name, document, service_type, monthly_amount, email, phone, pix_key, payment_date, notes) VALUES
('Carlos Consultoria LTDA', '12.345.678/0001-90', 'Consultoria em TI', 5000.00, 'carlos@consultoria.com', '(11) 77777-7777', '12345678000190', 5, 'Prestador de serviços especializado'),
('Ana Design Studio', '98.765.432/0001-10', 'Design Gráfico', 3500.00, 'ana@designstudio.com', '(11) 66666-6666', 'ana@designstudio.com', 10, 'Trabalhos de qualidade superior')
ON CONFLICT DO NOTHING;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_clt_employees_updated_at 
BEFORE UPDATE ON public.clt_employees 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at 
BEFORE UPDATE ON public.service_providers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
