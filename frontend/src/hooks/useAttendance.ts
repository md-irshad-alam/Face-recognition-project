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

export const useAttendance = (class_name?: string) => {
  return useQuery<AttendanceRecord[]>({
    queryKey: ['attendance', 'today', class_name],
    queryFn: async () => {
      // Clean up params: only send class_name
      const response = await api.get<AttendanceRecord[]>('/attendance/today', {
        params: { class_name }
      });
      return response;
    },
    refetchInterval: 30000, 
  });
};

export interface Device {
  device_id: string;
  device_name?: string;
  device_type?: string;
  status: string;
  battery_level?: number;
  ip_address?: string;
  last_sync?: string;
}

export const useDevices = () => {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get<Device[]>('/devices');
      return response;
    },
    refetchInterval: 10000, // Faster refetch for devices
  });
};

