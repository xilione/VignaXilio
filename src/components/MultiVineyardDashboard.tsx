import { useEffect, useState } from 'react';
import { MapPin, Loader2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { calculateTreatmentIndices } from '@/hooks/useWeather';
import type { Location, WeatherData, TreatmentIndex } from '@/types';

interface DashboardProps {
  onSelectLocation: (location: Location) => void;
}

export function MultiVineyardDashboard({ onSelectLocation }: DashboardProps) {
  const { savedLocations, loading: locationsLoading } = useSavedLocations();
  const [weatherDataMap, setWeatherDataMap] = useState<Record<string, WeatherData>>({});
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const fetchAllWeather = async () => {
      if (savedLocations.length === 0) return;
      
      setLoadingWeather(true);
      const newMap: Record<string, WeatherData> = {};
      
      for (const loc of savedLocations) {
        try {
          const params = new URLSearchParams({
            latitude: loc.latitude.toString(),
            longitude: loc.longitude.toString(),
            current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index',
            hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_temperature_18cm,soil_moisture_9_to_27cm',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
            timezone: 'auto',
            forecast_days: '7'
          });

          const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
          if (response.ok) {
            const data = await response.json();
            
            // Simplified formatting just for the dashboard indices
            const formattedData: WeatherData = {
              current: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                windSpeed: data.current.wind_speed_10m,
                windDirection: data.current.wind_direction_10m,
                precipitation: data.current.precipitation,
                pressure: data.current.surface_pressure,
                uvIndex: data.current.uv_index,
                condition: '',
                icon: ''
              },
              daily: [{
                date: data.daily.time[0],
                maxTemp: data.daily.temperature_2m_max[0],
                minTemp: data.daily.temperature_2m_min[0],
                humidity: data.hourly.relative_humidity_2m[0],
                precipitation: data.daily.precipitation_sum[0],
                precipitationProbability: data.daily.precipitation_probability_max[0],
                windSpeed: data.daily.wind_speed_10m_max[0],
                condition: '',
                icon: '',
                uvIndex: data.daily.uv_index_max[0],
                gdd: 0
              }],
              hourly: [],
              gdd: 0
            };
            newMap[loc.name] = formattedData;
          }
        } catch (error) {
          console.error(`Error fetching weather for ${loc.name}`, error);
        }
      }
      
      setWeatherDataMap(newMap);
      setLoadingWeather(false);
    };

    fetchAllWeather();
  }, [savedLocations]);

  if (locationsLoading || loadingWeather) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Caricamento dashboard vigne...</p>
      </div>
    );
  }

  if (savedLocations.length === 0) {
    return null;
  }

  const getStatusIcon = (status: 'good' | 'caution' | 'bad') => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'caution': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'bad': return <ShieldAlert className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Dashboard Vigne Salvate</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedLocations.map((loc) => {
          const weather = weatherDataMap[loc.name];
          let indices: TreatmentIndex[] = [];
          if (weather) {
            indices = calculateTreatmentIndices(weather);
          }

          return (
            <div 
              key={loc.name} 
              className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectLocation(loc)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{loc.customName || loc.name}</h3>
                    {loc.customName && (
                      <p className="text-xs text-muted-foreground italic">{loc.name}</p>
                    )}
                    {loc.phenologicalStage && (
                      <p className="text-xs text-muted-foreground">{loc.phenologicalStage}</p>
                    )}
                  </div>
                </div>
              </div>

              {weather ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Peronospora</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{indices[0]?.value}%</span>
                      {getStatusIcon(indices[0]?.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Oidio</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{indices[1]?.value}%</span>
                      {getStatusIcon(indices[1]?.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Botrite</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{indices[2]?.value}%</span>
                      {getStatusIcon(indices[2]?.status)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Dati non disponibili
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
