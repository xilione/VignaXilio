import { Droplets, ThermometerSun, Sun } from 'lucide-react';
import type { WeatherData } from '@/types';

interface SoilAndGDDProps {
  weather: WeatherData;
}

export function SoilAndGDD({ weather }: SoilAndGDDProps) {
  const { current, gdd } = weather;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
        <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
          <ThermometerSun className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Temp. Suolo (10cm)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{current.soilTemperature10cm?.toFixed(1) || '--'}</span>
            <span className="text-muted-foreground">°C</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
          <Droplets className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Umidità Suolo (10-28cm)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{current.soilMoisture10to28cm ? (current.soilMoisture10to28cm * 100).toFixed(0) : '--'}</span>
            <span className="text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
        <div className="p-3 bg-orange-100 rounded-lg text-orange-700">
          <Sun className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-medium">Gradi Giorno (GDD 7gg)</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{gdd.toFixed(0)}</span>
            <span className="text-muted-foreground">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
