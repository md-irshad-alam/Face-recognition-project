import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AttendanceEvent {
  id: string;
  type: string;
  msg: string;
  time: string;
  device: string;
  status: 'success' | 'fail' | 'error';
  student_name?: string;
}

interface AttendanceState {
  events: AttendanceEvent[];
  addEvent: (event: Omit<AttendanceEvent, 'id'>) => void;
  clearEvents: () => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (event) => set((state) => ({
        events: [
          { ...event, id: Math.random().toString(36).substring(2, 9) },
          ...state.events
        ].slice(0, 100), // Keep last 100 events
      })),
      clearEvents: () => set({ events: [] }),
    }),
    {
      name: 'attendance-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
