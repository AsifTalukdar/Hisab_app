export type Profile = {
  id: string;
  business_name: string;
  phone: string | null;
  logo_url: string | null;
  address: string | null;
  bkash_number: string | null;
  created_at: string;
};

export type Client = {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address: string | null;
  created_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  notes: string | null;
  subtotal: number;
  total: number;
  created_at: string;
  // joined
  clients?: Pick<Client, "id" | "name" | "phone" | "address">;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
};

export type InvoiceWithItems = Invoice & { invoice_items: InvoiceItem[] };
