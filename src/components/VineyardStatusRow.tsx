import { Leaf, Droplets, ThermometerSun, Sun } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHENOLOGICAL_STAGES } from '@/types';
import type { Location, WeatherData } from '@/types';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useAuth } from '@/hooks/useAuth';

interface VineyardStatusRowProps {
  location: Location;
  weather: WeatherData;
}

export function VineyardStatusRow({ location, weather }: VineyardStatusRowProps) {
  const { updateLocation, isSaved } = useSavedLocations();
  const { user } = useAuth();
  const { current, gdd } = weather;

  const handleStageChange = async (stage: string) => {
    if (!isSaved(location)) return;
    const updatedLocation = { ...location, phenologicalStage: stage };
    await updateLocation(location, updatedLocation);
  };

  const showPhenology = user && isSaved(location);

  return (
    <div className={`grid grid-cols-2 ${showPhenology ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 mb-8`}>
      {/* Fase Fenologica (Solo se salvata) */}
      {showPhenology && (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
          <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
            <Leaf className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest mb-0.5">Fase Fenologica</p>
            <Select 
              value={location.phenologicalStage || ''} 
              onValueChange={handleStageChange}
            >
              <SelectTrigger className="h-7 border-0 bg-transparent p-0 focus:ring-0 shadow-none font-bold text-sm truncate text-slate-800">
                <SelectValue placeholder="Seleziona fase" />
              </SelectTrigger>
              <SelectContent>
                {PHENOLOGICAL_STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Temp. Suolo */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-amber-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
          <ThermometerSun className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest mb-0.5">Temp. Suolo</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-800">{current.soilTemperature10cm?.toFixed(1) || '--'}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">°C</span>
          </div>
        </div>
      </div>

      {/* Umidità Suolo */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
          <Droplets className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest mb-0.5">Umidità Suolo</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-800">
              {current.soilMoisture10to28cm ? (current.soilMoisture10to28cm * 100).toFixed(0) : '--'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">%</span>
          </div>
        </div>
      </div>

      {/* Gradi Giorno */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:scale-110 transition-transform">
          <Sun className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest mb-0.5">Gradi Giorno</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-slate-800">{gdd.toFixed(0)}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase">GDD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
