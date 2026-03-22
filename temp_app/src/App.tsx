import { useState, useEffect } from 'react';
import { Loader2, MapPin, Sprout } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchLocation } from '@/components/SearchLocation';
import { CurrentWeather } from '@/components/CurrentWeather';
import { TreatmentIndices } from '@/components/TreatmentIndices';
import { TreatmentRecommendations } from '@/components/TreatmentRecommendations';
import { DailyForecast } from '@/components/DailyForecast';
import { HourlyChart } from '@/components/HourlyChart';
import { useWeather, calculateTreatmentIndices, getTreatmentRecommendations } from '@/hooks/useWeather';
import type { Location } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Coordinate di default (Italia centrale - Roma)
const DEFAULT_LOCATION: Location = {
  name: 'Roma',
  latitude: 41.9028,
  longitude: 12.4964,
  region: 'Lazio, Italia'
};

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { weatherData, loading, error, fetchWeather } = useWeather();

  // Carica il meteo per la località di default all'avvio
  useEffect(() => {
    fetchWeather(DEFAULT_LOCATION);
    setSelectedLocation(DEFAULT_LOCATION);
  }, [fetchWeather]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    fetchWeather(location);
  };

  const handleRefresh = () => {
    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  };

  const treatmentIndices = weatherData ? calculateTreatmentIndices(weatherData) : [];
  const recommendations = weatherData ? getTreatmentRecommendations(weatherData) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Sezione ricerca */}
        <section className="mb-8">
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Previsioni Meteo per la Vigna
            </h2>
            <p className="text-muted-foreground">
              Inserisci la località della tua vigna per ricevere previsioni dettagliate 
              e indicazioni sui trattamenti da effettuare
            </p>
          </div>
          
          <SearchLocation 
            onSelectLocation={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </section>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Caricamento previsioni...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="max-w-md mx-auto mb-8">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Content */}
        {!loading && weatherData && selectedLocation && (
          <div className="space-y-8">
            {/* Info bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-primary/5 rounded-xl">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {selectedLocation.name}{selectedLocation.region ? `, ${selectedLocation.region}` : ''}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={loading}
                className="gap-2"
              >
                <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Aggiorna dati
              </Button>
            </div>

            {/* Griglia principale */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Colonna sinistra - Meteo attuale e indici */}
              <div className="lg:col-span-2 space-y-6">
                <CurrentWeather 
                  weather={weatherData} 
                  locationName={selectedLocation.name}
                />
                
                <HourlyChart hourly={weatherData.hourly} />
                
                <DailyForecast forecasts={weatherData.daily} />
              </div>

              {/* Colonna destra - Indici e raccomandazioni */}
              <div className="space-y-6">
                <TreatmentIndices indices={treatmentIndices} />
                
                <TreatmentRecommendations recommendations={recommendations} />
                
                {/* Card informativa */}
                <div className="p-5 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-lg">Consigli del Giorno</h3>
                  </div>
                  <ul className="space-y-3 text-sm text-green-100">
                    <li className="flex items-start gap-2">
                      <span className="text-green-300 mt-0.5">•</span>
                      <span>Effettua i trattamenti nelle prime ore del mattino quando l'umidità è più bassa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-300 mt-0.5">•</span>
                      <span>Evita di trattare con vento superiore a 15 km/h per prevenire deriva</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-300 mt-0.5">•</span>
                      <span>Monitora l'indice UV per ottimizzare l'efficacia dei prodotti</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-300 mt-0.5">•</span>
                      <span>Attendi almeno 4-6 ore senza pioggia dopo il trattamento</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stato iniziale - nessuna località selezionata */}
        {!loading && !weatherData && !error && (
          <div className="text-center py-16">
            <div className="p-6 bg-primary/10 rounded-full inline-block mb-4">
              <MapPin className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cerca una località</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Inserisci il nome della città o del comune dove si trova la tua vigna 
              per visualizzare le previsioni meteo e i consigli per i trattamenti.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
