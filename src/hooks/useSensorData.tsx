import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

export interface SensorData {
  mq4_ppm: number;
  mq7_ppm: number;
  mq137_ppm: number;
  timestamp: string;
}

export interface SensorState {
  isLoading: boolean;
  error: Error | null;
  currentData: SensorData | null;
  historicalData: SensorData[];
}

const API_URL = 'http://6a78-131-104-23-252.ngrok-free.app'; // Update to new ngrok URL if changed
const POLLING_INTERVAL = 5000;

export function useSensorData(): SensorState & {
  refreshData: () => void;
} {
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  
  const fetchSensorData = async (): Promise<SensorData> => {
    try {
      const response = await axios.get(`${API_URL}/raw`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'curl/7.68.0',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data:', response.data);

      const data: SensorData = response.data;
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        const message = error.response?.data || error.message;
        throw new Error(`Failed to fetch sensor data: ${message}`);
      }
      console.error('Error fetching sensor data:', error);
      throw new Error('Failed to fetch sensor data. Check server connection.');
    }
  };

  const { 
    data: currentData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['sensorData'],
    queryFn: fetchSensorData,
    refetchInterval: POLLING_INTERVAL,
    retry: 3,
    onSuccess: (data) => {
      setHistoricalData(prev => {
        const newData = [...prev, data];
        return newData.slice(-20);
      });
    },
    onError: (error) => {
      toast.error('Failed to fetch sensor data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    isLoading,
    error: error as Error | null,
    currentData: currentData || null,
    historicalData,
    refreshData,
  };
}