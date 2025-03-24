import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SensorData, SensorState } from '@/lib/types';
import { toast } from 'sonner';

// API configuration
const API_URL = 'http://6a78-131-104-23-252.ngrok-free.app'; // Using the provided ngrok URL
const POLLING_INTERVAL = 5000; // in ms - fetch data every 5 seconds

/**
 * Hook to fetch and manage sensor data
 */
export function useSensorData(): SensorState & {
  refreshData: () => void;
} {
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  
  const fetchSensorData = async (): Promise<SensorData> => {
    try {
      const response = await fetch(`${API_URL}/raw`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      // Add timestamp if not provided by API
      if (!data.timestamp) {
        data.timestamp = new Date().toISOString();
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      throw new Error('Failed to fetch sensor data. Check server connection.');
    }
  };

  // Use react-query for data fetching with polling
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
    onSettled: (data, error) => {
      if (data) {
        // Add new data to historical data, keeping only recent history
        setHistoricalData(prev => {
          const newData = [...prev, data];
          // Keep only the last 20 data points
          return newData.slice(-20);
        });
      }
      
      if (error) {
        toast.error('Failed to fetch sensor data', {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
  });

  // Function to manually refresh data
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

// Mock function for development/demo purposes
export function useMockSensorData(): SensorState & {
  refreshData: () => void;
} {
  const [currentData, setCurrentData] = useState<SensorData | null>(null);
  const [historicalData, setHistoricalData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Generate mock data
  const generateMockData = useCallback((): SensorData => {
    // Simulate realistic fluctuations around base values
    const mq137_ppm = parseFloat((4.5 + Math.random() * 0.5).toFixed(2)); // Around 4.5-5.0
    const mq4_ppm = parseFloat((1.8 + Math.random() * 0.3).toFixed(2));   // Around 1.8-2.1
    const mq7_ppm = parseFloat((2.8 + Math.random() * 0.3).toFixed(2));   // Around 2.8-3.1
    
    return {
      mq137_ppm,
      mq4_ppm,
      mq7_ppm,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Refresh data manually
  const refreshData = useCallback(() => {
    const newData = generateMockData();
    setCurrentData(newData);
    setHistoricalData(prev => {
      const newHistory = [...prev, newData];
      return newHistory.slice(-20); // keep last 20 entries
    });
  }, [generateMockData]);

  // Initialize mock data
  useEffect(() => {
    // Initial load simulation
    setTimeout(() => {
      try {
        // Generate initial historical data
        const initialHistory: SensorData[] = Array(15)
          .fill(null)
          .map((_, i) => {
            const date = new Date();
            date.setMinutes(date.getMinutes() - (15 - i));
            
            return {
              mq137_ppm: parseFloat((4.5 + Math.random() * 0.5).toFixed(2)),
              mq4_ppm: parseFloat((1.8 + Math.random() * 0.3).toFixed(2)),
              mq7_ppm: parseFloat((2.8 + Math.random() * 0.3).toFixed(2)),
              timestamp: date.toISOString(),
            };
          });

        const latest = generateMockData();
        setHistoricalData([...initialHistory, latest]);
        setCurrentData(latest);
        setIsLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error'));
        setIsLoading(false);
      }
    }, 1000);

    // Set up polling interval
    const interval = setInterval(refreshData, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [generateMockData, refreshData]);

  return {
    isLoading,
    error,
    currentData,
    historicalData,
    refreshData,
  };
}
