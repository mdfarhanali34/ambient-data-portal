
export type SensorType = 'mq135' | 'mq4';

export interface SensorData {
  mq135: number;
  mq4: number;
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
