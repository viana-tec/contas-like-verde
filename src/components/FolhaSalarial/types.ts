
export interface CLTEmployee {
  id: string;
  name: string;
  document: string;
  position: string;
  base_salary: number;
  payment_day_1: number;
  payment_day_2: number;
  pix_key?: string;
  email?: string;
  phone?: string;
  salary_advance: number;
  status: string;
  hire_date: string;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  name: string;
  document: string;
  service_type: string;
  monthly_amount: number;
  payment_day_1: number;
  payment_day_2: number;
  pix_key?: string;
  email?: string;
  phone?: string;
  status: string;
  created_at: string;
}
