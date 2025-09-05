import { useState, useCallback } from 'react'
import { BillItem, Participant, CalculationResult } from '@/types'
import { calculateSplit } from '@/services/calculatorService'
import { generateSettlement } from '@/services/settlementService'

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

export function useCalculator(): UseCalculatorReturn {
  const [items, setItems] = useState<BillItem[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [results, setResults] = useState<CalculationResult | null>(null)

  const addItem = useCallback((item: Omit<BillItem, 'id'>) => {
    const newItem: BillItem = {
      ...item,
      id: crypto.randomUUID()
    }
    setItems(prev => [...prev, newItem])
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<BillItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const addParticipant = useCallback((participant: Omit<Participant, 'id'>) => {
    const newParticipant: Participant = {
      ...participant,
      id: crypto.randomUUID()
    }
    setParticipants(prev => [...prev, newParticipant])
  }, [])

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setParticipants(prev => prev.map(participant => 
      participant.id === id ? { ...participant, ...updates } : participant
    ))
  }, [])

  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(participant => participant.id !== id))
  }, [])

  const calculateResults = useCallback(() => {
    try {
      const splitResults = calculateSplit(items, participants)
      const settlement = generateSettlement(splitResults)
      
      const result: CalculationResult = {
        id: crypto.randomUUID(),
        items,
        participants,
        splitResults,
        settlement,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setResults(result)
    } catch (error) {
      console.error('계산 오류:', error)
    }
  }, [items, participants])

  const reset = useCallback(() => {
    setItems([])
    setParticipants([])
    setResults(null)
  }, [])

  return {
    items,
    participants,
    results,
    addItem,
    updateItem,
    removeItem,
    setItems,
    addParticipant,
    updateParticipant,
    removeParticipant,
    setParticipants,
    calculateResults,
    reset
  }
}