// Core types for the cost split calculator

export interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  category?: string
  assignedParticipants?: string[]
}

export interface Participant {
  id: string
  name: string
  email?: string
  share?: number
  color?: string
}

export interface CalculationResult {
  id: string
  items: BillItem[]
  participants: Participant[]
  splitResults: any
  settlement: any
  createdAt: Date
  updatedAt: Date
}

export type SplitMethod = 'equal' | 'custom' | 'percentage'

export interface OCRResult {
  items: BillItem[]
  confidence: number
  rawText?: string
}

export interface ImageFile extends File {
  id: string
  preview?: string
}

export interface UseCalculatorReturn {
  items: BillItem[]
  participants: Participant[]
  results: CalculationResult | null
  addItem: (item: Omit<BillItem, 'id'>) => void
  updateItem: (id: string, updates: Partial<BillItem>) => void
  removeItem: (id: string) => void
  setItems: (items: BillItem[]) => void
  addParticipant: (participant: Omit<Participant, 'id'>) => void
  updateParticipant: (id: string, updates: Partial<Participant>) => void
  removeParticipant: (id: string) => void
  setParticipants: (participants: Participant[]) => void
  calculateResults: () => void
  reset: () => void
}