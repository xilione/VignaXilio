import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { HourlyForecast } from '@/types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react';

interface HourlyChartProps {
  hourly: HourlyForecast[];
}

type ChartType = 'temperature' | 'humidity' | 'precipitation' | 'wind';

export function HourlyChart({ hourly }: HourlyChartProps) {
  const [chartType, setChartType] = useState<ChartType>('temperature');

  const chartConfig = {
    temperature: {
      label: 'Temperatura',
      icon: Thermometer,
      color: '#ef4444',
      fillColor: '#fee2e2',
      unit: '°C',
      dataKey: 'temperature'
    },
    humidity: {
      label: 'Umidità',
      icon: Droplets,
      color: '#3b82f6',
      fillColor: '#dbeafe',
      unit: '%',
      dataKey: 'humidity'
    },
    precipitation: {
      label: 'Precipitazioni',
      icon: CloudRain,
      color: '#6366f1',
      fillColor: '#e0e7ff',
      unit: 'mm',
      dataKey: 'precipitation'
    },
    wind: {
      label: 'Vento',
      icon: Wind,
      color: '#06b6d4',
      fillColor: '#cffafe',
      unit: 'km/h',
      dataKey: 'windSpeed'
    }
  };

  const config = chartConfig[chartType];
  const IconComponent = config.icon;

  // Prepara i dati per il grafico
  const chartData = hourly.map(h => ({
    time: h.time.substring(0, 5),
    temperature: h.temperature,
    humidity: h.humidity,
    precipitation: h.precipitation,
    windSpeed: h.windSpeed
  }));

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" style={{ color: config.color }} />
            Andamento Orario - {config.label}
          </CardTitle>
          <Tabs value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="temperature" className="px-2 sm:px-3">
                <Thermometer className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Temp</span>
              </TabsTrigger>
              <TabsTrigger value="humidity" className="px-2 sm:px-3">
                <Droplets className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Umid</span>
              </TabsTrigger>
              <TabsTrigger value="precipitation" className="px-2 sm:px-3">
                <CloudRain className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Prec</span>
              </TabsTrigger>
              <TabsTrigger value="wind" className="px-2 sm:px-3">
                <Wind className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Vento</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${chartType}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}${config.unit}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
                labelFormatter={(label) => `Ore ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey={config.dataKey} 
                stroke={config.color}
                strokeWidth={2}
                fill={`url(#gradient-${chartType})`}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
