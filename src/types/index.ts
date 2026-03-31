export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    pressure: number;
    uvIndex: number;
    condition: string;
    icon: string;
    soilTemperature10cm?: number;
    soilMoisture10to28cm?: number;
  };
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  gdd: number; // Accumulated Growing Degree Days for the forecast period
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  condition: string;
  icon: string;
  uvIndex: number;
  gdd: number; // Daily GDD
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
}

export interface TreatmentIndex {
  name: string;
  value: number;
  status: 'good' | 'caution' | 'bad';
  description: string;
  icon: string;
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  phenologicalStage?: string;
  customName?: string;
}

export interface TreatmentRecommendation {
  type: string;
  suitable: boolean;
  conditions: string[];
  bestTime: string;
  warnings: string[];
  suggestedProducts?: string[];
  applicationMethod?: string;
  fertilizationAdvice?: string;
}

export interface Treatment {
  id?: string;
  locationName: string;
  date: string;
  product: string;
  notes?: string;
}

export interface Irrigation {
  id?: string;
  locationName: string;
  date: string;
  amount: number; // in mm or liters
  notes?: string;
}

export const PHENOLOGICAL_STAGES = [
  'Riposo vegetativo',
  'Pianto',
  'Germogliamento',
  'Fioritura',
  'Allegagione',
  'Chiusura grappolo',
  'Invaiatura',
  'Maturazione',
  'Caduta foglie'
] as const;
