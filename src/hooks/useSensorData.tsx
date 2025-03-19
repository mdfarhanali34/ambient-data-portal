import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SensorData, SensorState } from '@/lib/types';
import { toast } from 'sonner';

// API configuration
const API_URL = 'http://localhost:3000'; // Update this with your actual API URL
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
    onSuccess: (data) => {
      // Add new data to historical data, keeping only recent history
      setHistoricalData(prev => {
        const newData = [...prev, data];
        // Keep only the last 20 data points
        return newData.slice(-20);
      });
    },
    onError: (error) => {
      toast.error('Failed to fetch sensor data', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
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
    const mq135 = Math.floor(110 + Math.random() * 10); // Air quality around 110-120
    const mq4 = Math.floor(225 + Math.random() * 10); // Methane around 225-235
    
    return {
      mq135,
      mq4,
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
              mq135: Math.floor(110 + Math.random() * 10),
              mq4: Math.floor(225 + Math.random() * 10),
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
