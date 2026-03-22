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
  };
  daily: DailyForecast[];
  hourly: HourlyForecast[];
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
}

export interface TreatmentRecommendation {
  type: string;
  suitable: boolean;
  conditions: string[];
  bestTime: string;
  warnings: string[];
}
