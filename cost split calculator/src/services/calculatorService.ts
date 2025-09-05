import { BillItem, Participant } from '@/types'

export function calculateSplit(items: BillItem[], participants: Participant[]) {
  return {
    items,
    participants,
    total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }
}

export default { calculateSplit }