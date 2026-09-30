import { create } from 'zustand'

export const useHabitStore = create((set) => ({
  habits: [],
  loading: true,
  setHabits: (habits) => set({ habits, loading: false }),
  updateHabit: (habitId, updates) =>
    set((state) => ({
      habits: state.habits.map((habit) =>
        habit.id === habitId
          ? { ...habit, ...updates }
          : habit,
      ),
    })),
  setLoading: (loading) => set({ loading }),
  resetHabits: () => set({ habits: [], loading: false }),
}))
