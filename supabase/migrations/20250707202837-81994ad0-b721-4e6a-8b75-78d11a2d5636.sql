-- Create table for storing Pagar.me API data
CREATE TABLE public.pagarme_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2),
  payment_method TEXT,
  authorization_code TEXT,
  tid TEXT,
  nsu TEXT,
  card_brand TEXT,
  card_last_four_digits TEXT,
  acquirer_name TEXT,
  installments INTEGER DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for accounts payable (contas a pagar)
CREATE TABLE public.accounts_payable (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  supplier TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  category TEXT,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for boletos (bank slips)
CREATE TABLE public.boletos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  barcode TEXT NOT NULL,
  digitable_line TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired')),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for service providers (prestadores de serviço)
CREATE TABLE public.service_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pix_key TEXT,
  service_type TEXT NOT NULL,
  monthly_amount DECIMAL(10,2) NOT NULL,
  payment_date INTEGER DEFAULT 5, -- day of month
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CLT employees
CREATE TABLE public.clt_employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  pix_key TEXT,
  position TEXT NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  advance_payment DECIMAL(10,2) DEFAULT 0, -- vale (adiantamento)
  discounts DECIMAL(10,2) DEFAULT 0,
  bonuses DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vacation')),
  hire_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table for authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for all tables
ALTER TABLE public.pagarme_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clt_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing authenticated users to access all data for now)
CREATE POLICY "Authenticated users can manage pagarme operations" ON public.pagarme_operations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage accounts payable" ON public.accounts_payable FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage boletos" ON public.boletos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage service providers" ON public.service_providers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage CLT employees" ON public.clt_employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pagarme_operations_updated_at BEFORE UPDATE ON public.pagarme_operations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON public.accounts_payable FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_boletos_updated_at BEFORE UPDATE ON public.boletos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clt_employees_updated_at BEFORE UPDATE ON public.clt_employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for accounts payable
INSERT INTO public.accounts_payable (description, supplier, amount, due_date, status, category) VALUES
('Energia Elétrica - Janeiro', 'CEMIG', 890.50, '2024-01-15', 'paid', 'Utilities'),
('Material de Escritório', 'Kalunga', 245.80, '2024-01-20', 'pending', 'Office Supplies'),
('Aluguel - Janeiro', 'Imobiliária XYZ', 3500.00, '2024-01-10', 'paid', 'Rent'),
('Internet - Janeiro', 'NET', 120.00, '2024-01-25', 'pending', 'Utilities'),
('Telefone - Janeiro', 'Vivo', 85.40, '2024-01-30', 'overdue', 'Utilities');

-- Insert sample data for boletos
INSERT INTO public.boletos (company_name, amount, due_date, barcode, status) VALUES
('CEMIG Distribuição S.A.', 890.50, '2024-01-15', '34191790010104351004791020150008184560000089050', 'paid'),
('Kalunga Comércio e Indústria', 245.80, '2024-01-20', '34191790010104351004791020150008184560000024580', 'pending'),
('NET Serviços de Comunicação', 120.00, '2024-01-25', '34191790010104351004791020150008184560000012000', 'pending');

-- Insert sample data for service providers
INSERT INTO public.service_providers (name, document, email, service_type, monthly_amount, pix_key) VALUES
('João Silva', '12345678901', 'joao@email.com', 'Contador', 2500.00, 'joao@email.com'),
('Maria Santos', '98765432100', 'maria@email.com', 'Designer', 1800.00, '+5511999999999'),
('Pedro Costa', '11122233344', 'pedro@email.com', 'Desenvolvedor', 4000.00, 'pedro@email.com');

-- Insert sample data for CLT employees
INSERT INTO public.clt_employees (name, document, position, base_salary, hire_date, pix_key) VALUES
('Ana Oliveira', '55566677788', 'Analista Financeiro', 3500.00, '2023-01-15', 'ana@email.com'),
('Carlos Ferreira', '99988877766', 'Assistente Administrativo', 2200.00, '2023-03-10', '+5511888888888'),
('Lucia Pereira', '44433322211', 'Gerente Comercial', 5500.00, '2022-11-20', 'lucia@email.com');