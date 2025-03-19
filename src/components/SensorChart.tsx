
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { SensorData, SensorType } from '@/lib/types';
import { formatTimestamp } from '@/utils/formatters';
import { sensorInfoData } from './SensorCard';

interface SensorChartProps {
  data: SensorData[];
  sensorType: SensorType;
  height?: number;
  className?: string;
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  sensorType: SensorType;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, sensorType }) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const sensorInfo = sensorInfoData[sensorType];
  const value = payload[0].value as number;
  
  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium">{formatTimestamp(label)}</p>
      <p className="text-lg font-semibold mt-1">
        {value} <span className="text-xs font-normal text-muted-foreground">{sensorInfo.unit}</span>
      </p>
    </div>
  );
};

const SensorChart: React.FC<SensorChartProps> = ({ 
  data, 
  sensorType, 
  height = 200,
  className
}) => {
  const sensorInfo = sensorInfoData[sensorType];
  
  // Process and format data for the chart
  const chartData = useMemo(() => {
    return data.map(item => ({
      timestamp: item.timestamp || new Date().toISOString(),
      value: item[sensorType]
    }));
  }, [data, sensorType]);
  
  // Calculate min and max values for better Y axis scaling
  const minValue = useMemo(() => 
    Math.floor(Math.min(...chartData.map(d => d.value)) * 0.9),
    [chartData]
  );
  
  const maxValue = useMemo(() => 
    Math.ceil(Math.max(...chartData.map(d => d.value)) * 1.1),
    [chartData]
  );

  // Get gradient colors based on sensor type
  const getGradientColors = () => {
    if (sensorType === 'mq135') {
      return {
        stroke: '#3B82F6', // blue 
        fill: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD']
      };
    } else {
      return {
        stroke: '#8B5CF6', // purple
        fill: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD']
      };
    }
  };
  
  const colors = getGradientColors();
  
  return (
    <div className={`relative p-4 rounded-xl border bg-card ${className}`}>
      <h3 className="text-sm font-medium mb-4">{sensorInfo.name} History</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`gradient-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                {colors.fill.map((color, index) => (
                  <stop 
                    key={index} 
                    offset={`${index * 25}%`} 
                    stopColor={color} 
                    stopOpacity={1 - (index * 0.25)} 
                  />
                ))}
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatTimestamp}
              tick={{ fontSize: 10, fill: '#888' }}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[minValue, maxValue]}
              tick={{ fontSize: 10, fill: '#888' }}
              axisLine={false}
              tickLine={false}
              width={25}
            />
            <Tooltip 
              content={<CustomTooltip sensorType={sensorType} />} 
              cursor={{ stroke: '#888', strokeDasharray: '3 3', strokeOpacity: 0.3 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={colors.stroke} 
              strokeWidth={2}
              fill={`url(#gradient-${sensorType})`}
              animationDuration={1000}
              dot={false}
              activeDot={{ r: 4, stroke: colors.stroke, strokeWidth: 2, fill: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;
