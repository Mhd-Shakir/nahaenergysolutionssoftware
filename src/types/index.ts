export type ProjectStatus = 'quoted' | 'pending' | 'completed' | 'cancelled';
export type ProjectType = 'residential' | 'commercial';

export interface Customer {
  id: string;
  project_id: string;
  name: string;
  phone: string;
  address: string;
  system_kw: number;
  panel_brand: string;
  inverter_brand: string;
  actual_cost: number;
  subsidy: number;
  net_cost: number;
  status: ProjectStatus;
  type: ProjectType;
  district: string;
  created_at: string;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  customer_id: string;
  system_kw: number;
  panel_brand: string;
  inverter_brand: string;
  actual_cost: number;
  subsidy: number;
  net_cost: number;
  daily_output_min: number;
  daily_output_max: number;
  notes?: string;
  sent_at: string;
  valid_until: string;
}

export interface Sale {
  id: string;
  proposal_id: string;
  customer_id: string;
  amount: number;
  sale_date: string;
  district: string;
  commission: number;
  created_at: string;
}

export interface Product {
  id: string;
  system_kw: number;
  base_cost: number;
  panel_type: string;
  inverter_type: string;
  updated_at: string;
}

export type InvoiceStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  proposal_id?: string;
  amount: number;
  paid_amount: number;
  status: InvoiceStatus;
  due_date?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}
