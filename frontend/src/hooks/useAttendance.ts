import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

export interface AttendanceRecord {
  student_id: string;
  name: string;
  program: string;
  section: string;
  photo_url: string;
  check_in_time: string;
  status: string;
  remarks: string;
}

export const useAttendance = (class_name?: string, section?: string) => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', 'today', class_name, section],
    queryFn: async () => {
      const response = await api.get<AttendanceRecord[]>('/attendance/today', {
        params: { class_name, section }
      });
      return response;
    },
    refetchInterval: 30000, // Refetch every 30 seconds as backup to WebSocket
  });
};

export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/devices');
      return response;
    },
    refetchInterval: 10000, // Faster refetch for devices
  });
};
