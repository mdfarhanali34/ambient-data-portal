
import React from 'react';
import { 
  Gauge, 
  CloudFog, 
  Flame, 
  Info,
  Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  formatSensorValue, 
  getSensorStatus, 
  getStatusText, 
  getStatusClasses 
} from '@/utils/formatters';
import { SensorInfo, SensorType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SensorCardProps {
  value: number;
  sensor: SensorInfo;
  className?: string;
}

// Sensor info data
export const sensorInfoData: Record<SensorType, SensorInfo> = {
  mq137: {
    id: 'mq137',
    name: 'Air Quality',
    description: 'Measures air quality including ammonia, CO2, and other gases',
    unit: 'ppm',
    icon: 'cloud',
    thresholds: {
      good: 3.0,
      warning: 4.5,
      danger: 6.0,
    },
    color: 'air',
  },
  mq4: {
    id: 'mq4',
    name: 'Methane',
    description: 'Measures methane and natural gas concentrations',
    unit: 'ppm',
    icon: 'flame',
    thresholds: {
      good: 1.5,
      warning: 2.5,
      danger: 3.5,
    },
    color: 'methane',
  },
  mq7: {
    id: 'mq7',
    name: 'Carbon Monoxide',
    description: 'Measures carbon monoxide (CO) concentrations',
    unit: 'ppm',
    icon: 'wind',
    thresholds: {
      good: 2.0,
      warning: 3.0,
      danger: 4.0,
    },
    color: 'carbon',
  },
};

const SensorCard: React.FC<SensorCardProps> = ({ value, sensor, className }) => {
  const status = getSensorStatus(value, sensor.thresholds);
  const statusText = getStatusText(status);
  
  // Dynamic icon based on sensor type
  const renderIcon = () => {
    switch (sensor.icon) {
      case 'cloud':
        return <CloudFog className={`h-6 w-6 text-${sensor.color}`} />;
      case 'flame':
        return <Flame className={`h-6 w-6 text-${sensor.color}`} />;
      case 'wind':
        return <Wind className={`h-6 w-6 text-${sensor.color}`} />;
      default:
        return <Gauge className={`h-6 w-6 text-${sensor.color}`} />;
    }
  };
  
  return (
    <div className={cn("sensor-card animate-scale-in", className)}>
      <div className="absolute top-0 right-0 left-0 h-1" 
           style={{ 
             backgroundColor: 
               status === 'good' ? 'var(--color-green-500)' : 
               status === 'warning' ? 'var(--color-amber-500)' : 
               'var(--color-red-500)',
             opacity: 0.8
           }} />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <h3 className="font-medium">{sensor.name}</h3>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] text-xs">
              <p>{sensor.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Value */}
      <div className="space-y-2">
        <div className="value-display animate-pulse-subtle">
          {value}
          <span className="text-lg text-muted-foreground ml-1">{sensor.unit}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "chip border",
            status === 'good' ? 'bg-green-100 text-green-800 border-green-200' :
            status === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            'bg-red-100 text-red-800 border-red-200'
          )}>
            {statusText}
          </span>
          
          <span className="text-xs text-muted-foreground">
            {status === 'good' ? 'Healthy levels' : 
             status === 'warning' ? 'Moderate concern' : 
             'High levels detected'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SensorCard;
