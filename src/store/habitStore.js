import { create } from 'zustand'

export const useHabitStore = create((set) => ({
  habits: [],
  loading: true,
  setHabits: (habits) => set({ habits, loading: false }),
  setLoading: (loading) => set({ loading }),
  resetHabits: () => set({ habits: [], loading: false }),
}))
