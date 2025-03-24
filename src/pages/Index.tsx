
import React, { useState, useEffect } from 'react';
import { useSensorData } from '@/hooks/useSensorData';
import Header from '@/components/Header';
import SensorCard, { sensorInfoData } from '@/components/SensorCard';
import SensorChart from '@/components/SensorChart';
import { formatTimestamp } from '@/utils/formatters';
import { CircleOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  // Use the real data hook instead of mock data
  const { 
    currentData, 
    historicalData, 
    isLoading, 
    error, 
    refreshData 
  } = useSensorData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    toast.success('Data refreshed');
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  // Staggered animation entrance
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Get last updated time
  const lastUpdated = currentData?.timestamp 
    ? formatTimestamp(currentData.timestamp)
    : 'Never';
  
  return (
    <div className="min-h-screen w-full bg-background text-foreground px-4 py-8 md:px-8 lg:px-12 transition-all duration-500">
      <div className="max-w-6xl mx-auto">
        <Header 
          title="Ammonia Monitor"
          subtitle="Real-time sensor data from ESP01"
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <Separator className="my-6" />
        
        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 my-6 flex items-center gap-4 animate-fade-in">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-medium text-destructive">Connection Error</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error.message || 'Failed to connect to the sensor data API'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                className="mt-3"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="rounded-xl border h-[200px] bg-card/50 animate-pulse"
              />
            ))}
          </div>
        )}
        
        {/* No data state */}
        {!isLoading && !error && !currentData && (
          <div className="rounded-lg border border-muted p-6 my-6 flex items-center gap-4 animate-fade-in">
            <CircleOff className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-medium">No Data Available</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No sensor data has been received yet.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh} 
                className="mt-3"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}
        
        {/* Sensor Cards */}
        {!isLoading && !error && currentData && (
          <>
            <div 
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 my-6 transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <SensorCard 
                value={currentData.mq137_ppm} 
                sensor={sensorInfoData.mq137} 
                className="stagger-1"
              />
              <SensorCard 
                value={currentData.mq4_ppm} 
                sensor={sensorInfoData.mq4} 
                className="stagger-2"
              />
              <SensorCard 
                value={currentData.mq7_ppm} 
                sensor={sensorInfoData.mq7} 
                className="stagger-3"
              />
            </div>
            
            {/* Charts */}
            {historicalData.length > 0 && (
              <div className="space-y-6 my-6">
                <SensorChart 
                  data={historicalData} 
                  sensorType="mq137" 
                  className="w-full stagger-4" 
                />
                <SensorChart 
                  data={historicalData} 
                  sensorType="mq4" 
                  className="w-full stagger-5" 
                />
                <SensorChart 
                  data={historicalData} 
                  sensorType="mq7" 
                  className="w-full stagger-6" 
                />
              </div>
            )}
          </>
        )}
        
        {/* Footer */}
        <footer className="mt-12 pt-6 border-t text-xs text-muted-foreground flex justify-between items-center animate-fade-in">
          <p>Air Quality Dashboard</p>
          <p>Powered by ESP8266 + FastAPI</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
