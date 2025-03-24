
import { SensorInfo, SensorType } from '@/lib/types';

/**
 * Format a sensor value with a unit
 */
export const formatSensorValue = (value: number, unit: string): string => {
  return `${value} ${unit}`;
};

/**
 * Get the status of a sensor based on its current value and thresholds
 */
export const getSensorStatus = (
  value: number,
  thresholds: SensorInfo['thresholds']
): 'good' | 'warning' | 'danger' => {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.warning) return 'warning';
  return 'danger';
};

/**
 * Get a human-readable description of the sensor status
 */
export const getStatusText = (status: 'good' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'good':
      return 'Good';
    case 'warning':
      return 'Moderate';
    case 'danger':
      return 'Poor';
    default:
      return 'Unknown';
  }
};

/**
 * Get css class names for a sensor status
 */
export const getStatusClasses = (
  status: 'good' | 'warning' | 'danger',
  sensorType: SensorType
): string => {
  const baseColor = sensorType === 'mq137' ? 'air' : 'methane';
  
  switch (status) {
    case 'good':
      return `bg-${baseColor}-good/10 text-${baseColor}-good border-${baseColor}-good/20`;
    case 'warning':
      return `bg-${baseColor}-warning/10 text-${baseColor}-warning border-${baseColor}-warning/20`;
    case 'danger':
      return `bg-${baseColor}-danger/10 text-${baseColor}-danger border-${baseColor}-danger/20`;
    default:
      return `bg-${baseColor}-muted text-${baseColor}-foreground border-${baseColor}/20`;
  }
};

/**
 * Format a timestamp for display
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

/**
 * Format a date for display
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
