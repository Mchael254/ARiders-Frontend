export interface MpesaReceiptRole {
  role_id: string;
  role_name: string;
  start_date: string;
  is_active: boolean;
}

export interface MpesaReceiptMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  current_role: MpesaReceiptRole;
}

export interface EventDetails {
  event_id: string;
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_location: string;
  event_fee: number;
}

export interface MpesaReceipt {
  receipt_number: string;
  amount: number;
  payment_type: string;
  transaction_date: string;
  order_id: string;
  phone_number: string;
  status: string;
  event_details: EventDetails | null;
}

export interface PaymentAnalysis {
  total_attempted: number;
  total_received: number;
  total_receipts: number;
  successful_receipts: number;
  failed_receipts: number;
}

export interface MemberPaymentData {
  member: MpesaReceiptMember;
  receipts: MpesaReceipt[];
  analysis: PaymentAnalysis;
}

export interface MpesaReceiptsResponse {
  members: MemberPaymentData[];
  grand_total: PaymentAnalysis;
  message: string;
}

export interface MpesaReceiptsData {
  members: MemberPaymentData[];
  grand_total: PaymentAnalysis;
  message: string;
}