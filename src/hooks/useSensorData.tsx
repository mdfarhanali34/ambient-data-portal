import { useState, useCallback, useEffect } from 'react';
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

const API_URL = 'http://6a78-131-104-23-252.ngrok-free.app'; // Ensure this URL is current
const POLLING_INTERVAL = 5000;

export function useSensorData(): SensorState & {
  refreshData: () => void;
} {
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);

  const fetchSensorData = async (): Promise<SensorData> => {
    const response = await axios.get(`${API_URL}/raw`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'curl/7.68.0',
      },
    });
    return response.data;
  };

  const { data: currentData, isLoading, error, refetch } = useQuery({
    queryKey: ['sensorData'],
    queryFn: fetchSensorData,
    refetchInterval: POLLING_INTERVAL,
    retry: 3,
  });

  // Ensure historicalData updates correctly when currentData changes
  useEffect(() => {
    if (currentData) {
      setHistoricalData((prevData) => {
        const newData = [...prevData, currentData];
        return newData.slice(-20); // Keep the latest 20 records
      });
    }
  }, [currentData]);

  const refreshData = useCallback(() => {
    refetch();
  }, [refetch]);

  // Error handling with toast
  useEffect(() => {
    if (error) {
      toast.error('Failed to fetch sensor data', {
        description: error.message,
      });
    }
  }, [error]);

  return {
    isLoading,
    error: error as Error | null,
    currentData: currentData || null,
    historicalData,
    refreshData,
  };
}
