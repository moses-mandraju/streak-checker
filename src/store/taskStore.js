import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  tasks: [],
  loading: true,
  setTasks: (tasks) => set({ tasks, loading: false }),
  setLoading: (loading) => set({ loading }),
  resetTasks: () => set({ tasks: [], loading: false }),
}))
