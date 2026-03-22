import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudDrizzle, 
  CloudRain, 
  Snowflake, 
  CloudLightning,
  CloudFog,
  Thermometer,
  Droplets,
  Wind
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyForecast as DailyForecastType } from '@/types';

interface DailyForecastProps {
  forecasts: DailyForecastType[];
}

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-showers-heavy': CloudRain,
  'snowflake': Snowflake,
  'bolt': CloudLightning
};

export function DailyForecast({ forecasts }: DailyForecastProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Oggi';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Domani';
    } else {
      return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric' });
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/5">
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-amber-500" />
          Previsioni 7 Giorni
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-3">
          {forecasts.map((day, index) => {
            const IconComponent = weatherIcons[day.icon] || Sun;
            
            return (
              <div 
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {/* Data */}
                <div className="w-20 font-medium text-sm">
                  {formatDate(day.date)}
                </div>

                {/* Icona */}
                <div className="w-10 flex justify-center">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>

                {/* Condizione */}
                <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
                  {day.condition}
                </div>

                {/* Temperature */}
                <div className="flex items-center gap-2 w-24">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">
                    {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
                  </span>
                </div>

                {/* Precipitazioni */}
                <div className="flex items-center gap-2 w-20">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{day.precipitationProbability}%</span>
                </div>

                {/* Vento */}
                <div className="flex items-center gap-2 w-20 hidden sm:flex">
                  <Wind className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm">{Math.round(day.windSpeed)} km/h</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
