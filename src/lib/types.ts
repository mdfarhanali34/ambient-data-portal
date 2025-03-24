
export type SensorType = 'mq137' | 'mq4' | 'mq7';

export interface SensorData {
  mq137_ppm: number;
  mq4_ppm: number;
  mq7_ppm: number;
  timestamp?: string;
}

export interface SensorInfo {
  id: SensorType;
  name: string;
  description: string;
  unit: string;
  icon: string;
  thresholds: {
    good: number;
    warning: number;
    danger: number;
  };
  color: string;
}

export interface ApiEndpoints {
  rawData: string;
  status: string;
}

export interface SensorState {
  isLoading: boolean;
  error: Error | null;
  currentData: SensorData | null;
  historicalData: SensorData[];
}
