import { useState, useEffect } from 'react';
import { Loader2, MapPin, Sprout, Bookmark, BookmarkCheck, LayoutDashboard, Map } from 'lucide-react';
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
import { AIAssistant } from '@/components/AIAssistant';
import { useAuth } from '@/hooks/useAuth';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { MultiVineyardDashboard } from '@/components/MultiVineyardDashboard';
import { TreatmentRegistry } from '@/components/TreatmentRegistry';
import { PhenologySelector } from '@/components/PhenologySelector';
import { SoilAndGDD } from '@/components/SoilAndGDD';
import { IrrigationManager } from '@/components/IrrigationManager';
import { VineyardMap } from '@/components/VineyardMap';

// Coordinate di default (Quartucciu, Sardegna)
const DEFAULT_LOCATION: Location = {
  name: 'Quartucciu',
  latitude: 39.2552,
  longitude: 9.2945,
  region: 'Sardegna, Italia'
};

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'detail'>('detail');
  const { weatherData, loading, error, fetchWeather } = useWeather();
  const { user } = useAuth();
  const { savedLocations, saveLocation, removeLocation, isSaved } = useSavedLocations();

  // Carica il meteo per la località di default all'avvio
  useEffect(() => {
    fetchWeather(DEFAULT_LOCATION);
    setSelectedLocation(DEFAULT_LOCATION);
  }, [fetchWeather]);

  // Se l'utente ha vigne salvate e fa login, mostra la dashboard
  useEffect(() => {
    if (user && savedLocations.length > 0 && !selectedLocation) {
      setViewMode('dashboard');
    }
  }, [user, savedLocations.length, selectedLocation]);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    fetchWeather(location);
    setViewMode('detail');
  };

  const handleRefresh = () => {
    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  };

  const toggleSaveLocation = () => {
    if (!selectedLocation || !user) return;
    if (isSaved(selectedLocation)) {
      removeLocation(selectedLocation);
    } else {
      saveLocation(selectedLocation);
    }
  };

  const treatmentIndices = weatherData ? calculateTreatmentIndices(weatherData) : [];
  const recommendations = weatherData ? getTreatmentRecommendations(weatherData) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Toggle View Mode */}
        {user && savedLocations.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white p-1 rounded-xl border shadow-sm">
              <Button
                variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-lg gap-2"
                onClick={() => setViewMode('dashboard')}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard Vigne
              </Button>
              <Button
                variant={viewMode === 'detail' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-lg gap-2"
                onClick={() => setViewMode('detail')}
              >
                <Map className="h-4 w-4" />
                Dettaglio Vigna
              </Button>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && user && savedLocations.length > 0 ? (
          <MultiVineyardDashboard onSelectLocation={handleLocationSelect} />
        ) : (
          <>
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
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button
                        variant={isSaved(selectedLocation) ? "secondary" : "outline"}
                        size="sm"
                        onClick={toggleSaveLocation}
                        className="gap-2"
                      >
                        {isSaved(selectedLocation) ? (
                          <>
                            <BookmarkCheck className="h-4 w-4 text-green-600" />
                            Salvata
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" />
                            Salva
                          </>
                        )}
                      </Button>
                    )}
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
                </div>

                {/* Phenology Selector (only if saved) */}
                {user && isSaved(selectedLocation) && (
                  <PhenologySelector location={savedLocationOrCurrent(selectedLocation, savedLocations)} />
                )}

                {/* Soil and GDD Data */}
                <SoilAndGDD weather={weatherData} />

                {/* Griglia principale */}
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Colonna sinistra - Meteo attuale e indici */}
                  <div className="lg:col-span-2 space-y-6">
                    <CurrentWeather 
                      weather={weatherData} 
                      locationName={selectedLocation.name}
                    />
                    
                    <VineyardMap 
                      latitude={selectedLocation.latitude} 
                      longitude={selectedLocation.longitude} 
                      name={selectedLocation.name} 
                    />
                    
                    <HourlyChart hourly={weatherData.hourly} />
                    
                    <DailyForecast forecasts={weatherData.daily} />
                  </div>

                  {/* Colonna destra - Indici e raccomandazioni */}
                  <div className="space-y-6">
                    <TreatmentIndices indices={treatmentIndices} />
                    
                    <TreatmentRecommendations recommendations={recommendations} />
                    
                    {/* Registro Trattamenti (only if user logged in) */}
                    {user && (
                      <TreatmentRegistry location={selectedLocation} />
                    )}

                    {/* Gestione Irrigazione (only if user logged in) */}
                    {user && (
                      <IrrigationManager location={savedLocationOrCurrent(selectedLocation, savedLocations)} weather={weatherData} />
                    )}

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
          </>
        )}
      </main>

      <Footer />
      <AIAssistant />
    </div>
  );
}

// Helper per ottenere la location salvata con la fase fenologica aggiornata
function savedLocationOrCurrent(current: Location, savedLocations: Location[]): Location {
  const saved = savedLocations.find(l => l.latitude === current.latitude && l.longitude === current.longitude);
  return saved || current;
}

export default App;
