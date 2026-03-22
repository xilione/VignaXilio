import { useState, useCallback } from 'react';
import type { WeatherData, Location, TreatmentIndex, TreatmentRecommendation } from '@/types';

const API_BASE = 'https://api.open-meteo.com/v1/forecast';

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (location: Location) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        latitude: location.latitude.toString(),
        longitude: location.longitude.toString(),
        current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index',
        hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_temperature_18cm,soil_moisture_9_to_27cm',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
        timezone: 'auto',
        forecast_days: '7'
      });

      const response = await fetch(`${API_BASE}?${params}`);
      
      if (!response.ok) {
        throw new Error('Errore nel recupero dei dati meteorologici');
      }

      const data = await response.json();
      
      let totalGDD = 0;
      const BASE_TEMP = 10; // Base temperature for vines

      const formattedDaily = data.daily.time.map((time: string, index: number) => {
        const maxTemp = data.daily.temperature_2m_max[index];
        const minTemp = data.daily.temperature_2m_min[index];
        const avgTemp = (maxTemp + minTemp) / 2;
        const dailyGDD = Math.max(0, avgTemp - BASE_TEMP);
        totalGDD += dailyGDD;

        return {
          date: time,
          maxTemp,
          minTemp,
          humidity: data.hourly.relative_humidity_2m[index * 24],
          precipitation: data.daily.precipitation_sum[index],
          precipitationProbability: data.daily.precipitation_probability_max[index],
          windSpeed: data.daily.wind_speed_10m_max[index],
          condition: getWeatherCondition(data.daily.weather_code[index]),
          icon: getWeatherIcon(data.daily.weather_code[index]),
          uvIndex: data.daily.uv_index_max[index],
          gdd: dailyGDD
        };
      });
      
      const formattedData: WeatherData = {
        current: {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDirection: data.current.wind_direction_10m,
          precipitation: data.current.precipitation,
          pressure: data.current.surface_pressure,
          uvIndex: data.current.uv_index,
          condition: getWeatherCondition(data.current.weather_code),
          icon: getWeatherIcon(data.current.weather_code),
          soilTemperature10cm: data.hourly.soil_temperature_18cm[0],
          soilMoisture10to28cm: data.hourly.soil_moisture_9_to_27cm[0]
        },
        daily: formattedDaily,
        hourly: data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
          time: time.split('T')[1],
          temperature: data.hourly.temperature_2m[index],
          humidity: data.hourly.relative_humidity_2m[index],
          precipitation: data.hourly.precipitation[index],
          windSpeed: data.hourly.wind_speed_10m[index],
          condition: getWeatherCondition(data.hourly.weather_code[index])
        })),
        gdd: totalGDD
      };

      setWeatherData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  return { weatherData, loading, error, fetchWeather };
}

export function useGeocoding() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 2) {
      setLocations([]);
      return;
    }

    setLoading(true);
    try {
      let customLocation: Location | null = null;
      
      // Check if query is a WGS84 coordinate pair (e.g. "39.2519, 9.1775" or "39.2519 9.1775")
      const coordRegex = /^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/;
      const match = query.trim().match(coordRegex);
      
      if (match) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        
        // Validate ranges
        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          customLocation = {
            name: `Coordinate: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
            latitude: lat,
            longitude: lon,
            region: 'Posizione WGS84'
          };
        }
      }

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=it&format=json`
      );
      const data = await response.json();
      
      let fetchedLocations: Location[] = [];
      if (data.results) {
        fetchedLocations = data.results.map((result: any) => ({
          name: result.name,
          latitude: result.latitude,
          longitude: result.longitude,
          region: result.admin1 || result.country
        }));
      }
      
      if (customLocation) {
        setLocations([customLocation, ...fetchedLocations]);
      } else {
        setLocations(fetchedLocations);
      }
    } catch (error) {
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { locations, loading, searchLocation };
}

export function calculateTreatmentIndices(weather: WeatherData): TreatmentIndex[] {
  const current = weather.current;
  const daily = weather.daily[0];
  
  // Indice Peronospora (umidità > 85% + temp 15-25°C = rischio alto)
  const peronosporaRisk = calculatePeronosporaRisk(current.humidity, current.temperature, daily.precipitation);
  
  // Indice Oidio (temp 20-30°C + umidità 40-70% = rischio medio)
  const oidioRisk = calculateOidioRisk(current.humidity, current.temperature);
  
  // Indice Botrite (umidità > 90% + temp 15-20°C = rischio alto)
  const botriteRisk = calculateBotriteRisk(current.humidity, current.temperature, daily.precipitation);
  
  // Indice Condizioni Trattamento
  const treatmentConditions = calculateTreatmentConditions(current, daily);
  
  return [
    {
      name: 'Rischio Peronospora',
      value: peronosporaRisk.value,
      status: peronosporaRisk.status,
      description: peronosporaRisk.description,
      icon: 'Droplets'
    },
    {
      name: 'Rischio Oidio',
      value: oidioRisk.value,
      status: oidioRisk.status,
      description: oidioRisk.description,
      icon: 'Cloud'
    },
    {
      name: 'Rischio Botrite',
      value: botriteRisk.value,
      status: botriteRisk.status,
      description: botriteRisk.description,
      icon: 'Grape'
    },
    {
      name: 'Condizioni Trattamento',
      value: treatmentConditions.value,
      status: treatmentConditions.status,
      description: treatmentConditions.description,
      icon: 'SprayCan'
    }
  ];
}

function calculatePeronosporaRisk(humidity: number, temp: number, precipitation: number): { value: number; status: 'good' | 'caution' | 'bad'; description: string } {
  let risk = 0;
  
  if (humidity > 85) risk += 40;
  else if (humidity > 70) risk += 20;
  
  if (temp >= 15 && temp <= 25) risk += 30;
  else if (temp >= 10 && temp <= 30) risk += 15;
  
  if (precipitation > 5) risk += 30;
  else if (precipitation > 0) risk += 15;
  
  risk = Math.min(100, risk);
  
  if (risk >= 70) return { value: risk, status: 'bad', description: 'Rischio elevato - Considerare trattamento preventivo' };
  if (risk >= 40) return { value: risk, status: 'caution', description: 'Rischio moderato - Monitorare attentamente' };
  return { value: risk, status: 'good', description: 'Rischio basso - Condizioni favorevoli' };
}

function calculateOidioRisk(humidity: number, temp: number): { value: number; status: 'good' | 'caution' | 'bad'; description: string } {
  let risk = 0;
  
  if (temp >= 20 && temp <= 30) risk += 40;
  else if (temp >= 15 && temp <= 35) risk += 20;
  
  if (humidity >= 40 && humidity <= 70) risk += 30;
  else if (humidity >= 30 && humidity <= 80) risk += 15;
  
  risk = Math.min(100, risk);
  
  if (risk >= 70) return { value: risk, status: 'bad', description: 'Rischio elevato - Condizioni favorevoli per oidio' };
  if (risk >= 40) return { value: risk, status: 'caution', description: 'Rischio moderato - Monitorare' };
  return { value: risk, status: 'good', description: 'Rischio basso' };
}

function calculateBotriteRisk(humidity: number, temp: number, precipitation: number): { value: number; status: 'good' | 'caution' | 'bad'; description: string } {
  let risk = 0;
  
  if (humidity > 90) risk += 50;
  else if (humidity > 80) risk += 25;
  
  if (temp >= 15 && temp <= 20) risk += 30;
  else if (temp >= 10 && temp <= 25) risk += 15;
  
  if (precipitation > 3) risk += 20;
  
  risk = Math.min(100, risk);
  
  if (risk >= 70) return { value: risk, status: 'bad', description: 'Rischio elevato - Alta umidità favorisce botrite' };
  if (risk >= 40) return { value: risk, status: 'caution', description: 'Rischio moderato' };
  return { value: risk, status: 'good', description: 'Rischio basso' };
}

function calculateTreatmentConditions(current: WeatherData['current'], daily: WeatherData['daily'][0]): { value: number; status: 'good' | 'caution' | 'bad'; description: string } {
  let score = 100;
  const issues: string[] = [];
  
  // Vento troppo forte
  if (current.windSpeed > 15) {
    score -= 40;
    issues.push('Vento troppo forte per trattamenti');
  } else if (current.windSpeed > 10) {
    score -= 20;
    issues.push('Vento moderato');
  }
  
  // Pioggia
  if (daily.precipitation > 5) {
    score -= 50;
    issues.push('Precipitazioni elevate - Posticipare trattamento');
  } else if (daily.precipitation > 0) {
    score -= 30;
    issues.push('Possibili piogge - Valutare posticipo');
  }
  
  // Temperatura estrema
  if (current.temperature > 30) {
    score -= 30;
    issues.push('Temperatura elevata - Evitare ore centrali');
  } else if (current.temperature < 5) {
    score -= 30;
    issues.push('Temperatura bassa');
  }
  
  // Umidità
  if (current.humidity > 95) {
    score -= 20;
    issues.push('Umidità molto alta');
  }
  
  score = Math.max(0, score);
  
  if (score >= 80) return { value: score, status: 'good', description: 'Ottime condizioni per trattamenti' };
  if (score >= 50) return { value: score, status: 'caution', description: issues.join('. ') };
  return { value: score, status: 'bad', description: issues.join('. ') };
}

export function getTreatmentRecommendations(weather: WeatherData): TreatmentRecommendation[] {
  const current = weather.current;
  const daily = weather.daily[0];
  
  return [
    {
      type: 'Trattamento Fungicida',
      suitable: current.windSpeed < 15 && daily.precipitation < 2 && current.temperature > 5 && current.temperature < 32,
      conditions: [
        `Vento: ${current.windSpeed < 10 ? '✓ Ottimale' : current.windSpeed < 15 ? '⚠ Moderato' : '✗ Troppo forte'} (${current.windSpeed} km/h)`,
        `Precipitazioni: ${daily.precipitation < 1 ? '✓ Assenti' : daily.precipitation < 2 ? '⚠ Leggere' : '✓ Previste'} (${daily.precipitation} mm)`,
        `Temperatura: ${current.temperature >= 10 && current.temperature <= 28 ? '✓ Ottimale' : '⚠ Da valutare'} (${current.temperature}°C)`
      ],
      bestTime: current.temperature > 25 ? 'Early morning (6-9h) o sera (dopo 18h)' : 'Mattina (8-11h)',
      warnings: daily.precipitation > 2 ? ['Rischio dilavamento se piove nelle 6h successive'] : []
    },
    {
      type: 'Trattamento Insetticida',
      suitable: current.windSpeed < 12 && daily.precipitation < 1 && current.temperature > 8 && current.temperature < 30,
      conditions: [
        `Vento: ${current.windSpeed < 8 ? '✓ Ottimale' : current.windSpeed < 12 ? '⚠ Moderato' : '✗ Troppo forte'} (${current.windSpeed} km/h)`,
        `Precipitazioni: ${daily.precipitation === 0 ? '✓ Assenti' : '⚠ Previste'} (${daily.precipitation} mm)`,
        `Temperatura: ${current.temperature >= 12 && current.temperature <= 25 ? '✓ Ottimale' : '⚠ Da valutare'} (${current.temperature}°C)`
      ],
      bestTime: 'Mattina presto (7-10h) quando gli insetti sono meno attivi',
      warnings: current.temperature > 28 ? ['Evitare ore calde - rischio volatilizzazione'] : []
    },
    {
      type: 'Concimazione Fogliare',
      suitable: current.windSpeed < 10 && daily.precipitation === 0 && current.humidity < 85 && current.temperature > 10 && current.temperature < 28,
      conditions: [
        `Vento: ${current.windSpeed < 8 ? '✓ Ottimale' : '⚠ Moderato'} (${current.windSpeed} km/h)`,
        `Umidità: ${current.humidity < 70 ? '✓ Ottimale' : current.humidity < 85 ? '⚠ Moderata' : '✗ Troppo alta'} (${current.humidity}%)`,
        `Precipitazioni: ${daily.precipitation === 0 ? '✓ Assenti' : '✗ Previste'} (${daily.precipitation} mm)`
      ],
      bestTime: 'Mattina (8-10h) con umidità moderata',
      warnings: current.humidity > 80 ? ['Umidità alta riduce assorbimento fogliare'] : []
    }
  ];
}

function getWeatherCondition(code: number): string {
  const conditions: Record<number, string> = {
    0: 'Sereno',
    1: 'Prevalentemente sereno',
    2: 'Parzialmente nuvoloso',
    3: 'Nuvoloso',
    45: 'Nebbia',
    48: 'Nebbia con brina',
    51: 'Pioggerella leggera',
    53: 'Pioggerella moderata',
    55: 'Pioggerella intensa',
    61: 'Pioggia leggera',
    63: 'Pioggia moderata',
    65: 'Pioggia intensa',
    71: 'Neve leggera',
    73: 'Neve moderata',
    75: 'Neve intensa',
    80: 'Rovesci leggeri',
    81: 'Rovesci moderati',
    82: 'Rovesci intensi',
    95: 'Temporale',
    96: 'Temporale con grandine',
    99: 'Temporale con forte grandine'
  };
  return conditions[code] || 'Sconosciuto';
}

function getWeatherIcon(code: number): string {
  if (code === 0) return 'sun';
  if (code <= 2) return 'cloud-sun';
  if (code === 3) return 'cloud';
  if (code <= 48) return 'fog';
  if (code <= 55) return 'cloud-drizzle';
  if (code <= 65) return 'cloud-rain';
  if (code <= 75) return 'snowflake';
  if (code <= 82) return 'cloud-showers-heavy';
  return 'bolt';
}
