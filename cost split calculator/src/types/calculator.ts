export interface Participant {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  color?: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo?: string[]; // 참가자 ID 배열
  splitRatio?: Record<string, number>; // 참가자별 분할 비율
}

export interface BillData {
  id: string;
  title: string;
  items: BillItem[];
  totalAmount: number;
  tax?: number;
  tip?: number;
  serviceCharge?: number;
  discount?: number;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

export type SplitMethod = 'equal' | 'itemBased' | 'percentage' | 'custom';

export interface SplitCalculation {
  participantId: string;
  participantName: string;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  serviceAmount: number;
  discountAmount: number;
  finalAmount: number;
  items: BillItem[];
}

export interface SplitResult {
  method: SplitMethod;
  calculations: SplitCalculation[];
  totalAmount: number;
  summary: {
    subtotal: number;
    tax: number;
    tip: number;
    serviceCharge: number;
    discount: number;
    finalTotal: number;
  };
  verification: {
    isValid: boolean;
    totalCheck: boolean;
    participantCheck: boolean;
    errors: string[];
  };
}

export interface Transfer {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export interface SettlementResult {
  transfers: Transfer[];
  totalTransfers: number;
  totalAmount: number;
  isOptimal: boolean;
  savings: {
    originalTransfers: number;
    optimizedTransfers: number;
    saved: number;
  };
}

export interface CalculationOptions {
  includeTax?: boolean;
  includeTip?: boolean;
  includeServiceCharge?: boolean;
  includeDiscount?: boolean;
  roundingMethod?: 'none' | 'round' | 'floor' | 'ceil';
  precision?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// 기본 옵션
export const DEFAULT_CALCULATION_OPTIONS: CalculationOptions = {
  includeTax: true,
  includeTip: true,
  includeServiceCharge: true,
  includeDiscount: true,
  roundingMethod: 'round',
  precision: 0, // 원 단위
};