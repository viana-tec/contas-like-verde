
-- Update accounts_payable table to work with real data (keeping existing sample data)
-- The table already exists, so we'll just ensure it has all needed columns

-- Update boletos table to store all barcode information
ALTER TABLE public.boletos 
ADD COLUMN IF NOT EXISTS company_document TEXT,
ADD COLUMN IF NOT EXISTS bank_code TEXT,
ADD COLUMN IF NOT EXISTS agency_code TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT;

-- Create payroll tables - one for service providers and one for CLT employees
-- Service providers table (already exists, just ensuring it has all needed columns)
ALTER TABLE public.service_providers 
ADD COLUMN IF NOT EXISTS payment_day_1 INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS payment_day_2 INTEGER DEFAULT 30;

-- CLT employees table with salary advance (vale)
ALTER TABLE public.clt_employees 
ADD COLUMN IF NOT EXISTS payment_day_1 INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS payment_day_2 INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS salary_advance DECIMAL(10,2) DEFAULT 0;

-- Update the advance_payment column name to salary_advance for consistency
UPDATE public.clt_employees SET salary_advance = COALESCE(advance_payment, 0) WHERE salary_advance IS NULL;

-- Add some sample CLT employees if table is empty
INSERT INTO public.clt_employees (name, document, position, base_salary, hire_date, pix_key, payment_day_1, payment_day_2)
SELECT 'Ana Oliveira', '55566677788', 'Analista Financeiro', 3500.00, '2023-01-15', 'ana@email.com', 15, 30
WHERE NOT EXISTS (SELECT 1 FROM public.clt_employees WHERE document = '55566677788');

INSERT INTO public.clt_employees (name, document, position, base_salary, hire_date, pix_key, payment_day_1, payment_day_2)
SELECT 'Carlos Ferreira', '99988877766', 'Assistente Administrativo', 2200.00, '2023-03-10', '+5511888888888', 15, 30
WHERE NOT EXISTS (SELECT 1 FROM public.clt_employees WHERE document = '99988877766');

-- Update service providers to have payment days
UPDATE public.service_providers 
SET payment_day_1 = 15, payment_day_2 = 30 
WHERE payment_day_1 IS NULL OR payment_day_2 IS NULL;
