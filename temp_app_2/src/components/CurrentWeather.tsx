import { 
  Thermometer, 
  Droplets, 
  Wind, 
  CloudRain, 
  Gauge, 
  Sun,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudRain as CloudRainIcon,
  Snowflake,
  CloudLightning,
  CloudFog
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeatherData } from '@/types';

interface CurrentWeatherProps {
  weather: WeatherData;
  locationName: string;
}

const weatherIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRainIcon,
  'cloud-showers-heavy': CloudRainIcon,
  'snowflake': Snowflake,
  'bolt': CloudLightning
};

export function CurrentWeather({ weather, locationName }: CurrentWeatherProps) {
  const { current } = weather;
  const IconComponent = weatherIcons[current.icon] || Sun;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Condizioni Attuali - {locationName}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Icona e temperatura principale */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <IconComponent className="h-24 w-24 text-primary" />
            </div>
            <div className="text-5xl font-bold mt-4">{Math.round(current.temperature)}°C</div>
            <div className="text-lg text-muted-foreground mt-1">{current.condition}</div>
          </div>

          {/* Griglia dettagli */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <WeatherDetail 
              icon={Droplets} 
              label="Umidità" 
              value={`${current.humidity}%`}
              color="text-blue-500"
            />
            <WeatherDetail 
              icon={Wind} 
              label="Vento" 
              value={`${current.windSpeed} km/h`}
              color="text-cyan-500"
            />
            <WeatherDetail 
              icon={CloudRain} 
              label="Precipitazioni" 
              value={`${current.precipitation} mm`}
              color="text-indigo-500"
            />
            <WeatherDetail 
              icon={Gauge} 
              label="Pressione" 
              value={`${Math.round(current.pressure)} hPa`}
              color="text-amber-500"
            />
            <WeatherDetail 
              icon={Sun} 
              label="Indice UV" 
              value={current.uvIndex.toString()}
              color="text-orange-500"
            />
            <WeatherDetail 
              icon={Thermometer} 
              label="Temperatura" 
              value={`${Math.round(current.temperature)}°C`}
              color="text-red-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface WeatherDetailProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}

function WeatherDetail({ icon: Icon, label, value, color }: WeatherDetailProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <Icon className={`h-5 w-5 ${color}`} />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
