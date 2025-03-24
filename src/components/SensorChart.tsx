import React, { useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { SensorData, SensorType } from '@/lib/types';
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

// Formatting timestamp explicitly
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, sensorType }) => {
  if (!active || !payload || payload.length === 0) return null;

  const sensorInfo = sensorInfoData[sensorType];
  const value = payload[0].value as number;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-sm p-3 text-sm">
      <p className="font-medium">{label}</p>
      <p className="text-lg font-semibold mt-1">
        {value}{' '}
        <span className="text-xs font-normal text-muted-foreground">
          {sensorInfo.unit}
        </span>
      </p>
    </div>
  );
};

const SensorChart: React.FC<SensorChartProps> = ({
  data,
  sensorType,
  height = 200,
  className,
}) => {
  const sensorInfo = sensorInfoData[sensorType];

  const chartData = useMemo(() => {
    const key = `${sensorType}_ppm`;
    return data.map((item) => ({
      timestamp: formatTimestamp(item.timestamp), // explicitly formatted
      value: item[key] ?? 0,
    }));
  }, [data, sensorType]);

  useEffect(() => {
    console.log(`Chart Data for ${sensorType}`, chartData);
  }, [chartData, sensorType]);

  const minValue = useMemo(() => {
    const values = chartData.map((d) => d.value);
    return values.length > 0 ? Math.floor(Math.min(...values) * 0.9) : 0;
  }, [chartData]);

  const maxValue = useMemo(() => {
    const values = chartData.map((d) => d.value);
    return values.length > 0 ? Math.ceil(Math.max(...values) * 1.1) : 10;
  }, [chartData]);

  const getGradientColors = () => {
    switch (sensorType) {
      case 'mq137':
        return { stroke: '#3B82F6', fill: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] };
      case 'mq4':
        return { stroke: '#8B5CF6', fill: ['#F5F3FF', '#EDE9FE', '#DDD6FE', '#C4B5FD'] };
      case 'mq7':
        return { stroke: '#EC4899', fill: ['#FCE7F3', '#FBCFE8', '#F9A8D4', '#F472B6'] };
      default:
        return { stroke: '#3B82F6', fill: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD'] };
    }
  };

  const colors = getGradientColors();

  return (
    <div className={`relative p-4 rounded-xl border bg-card ${className}`}>
      <h3 className="text-sm font-medium mb-4">{sensorInfo.name} History</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${sensorType}`} x1="0" y1="0" x2="0" y2="1">
                {colors.fill.map((color, index) => (
                  <stop
                    key={index}
                    offset={`${index * 25}%`}
                    stopColor={color}
                    stopOpacity={1 - index * 0.25}
                  />
                ))}
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
            <XAxis
              dataKey="timestamp"
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
              activeDot={{ r: 4, stroke: colors.stroke, strokeWidth: 2, fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorChart;