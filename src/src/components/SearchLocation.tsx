import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGeocoding } from '@/hooks/useWeather';
import type { Location } from '@/types';

interface SearchLocationProps {
  onSelectLocation: (location: Location) => void;
  selectedLocation: Location | null;
}

export function SearchLocation({ onSelectLocation, selectedLocation }: SearchLocationProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { locations, loading, searchLocation } = useGeocoding();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchLocation(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchLocation]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: Location) => {
    onSelectLocation(location);
    setQuery(location.name);
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Cerca località..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-12 py-6 text-lg rounded-xl border-2 border-primary/20 focus:border-primary transition-colors"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-50 overflow-hidden">
          {locations.length > 0 ? (
            <div className="max-h-64 overflow-auto">
              {locations.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(location)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                >
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground">{location.region}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : !loading ? (
            <div className="px-4 py-3 text-muted-foreground text-center">
              Nessuna località trovata
            </div>
          ) : null}
        </div>
      )}

      {selectedLocation && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <MapPin className="h-4 w-4" />
          <span>Località selezionata: <strong className="text-foreground">{selectedLocation.name}</strong></span>
        </div>
      )}
    </div>
  );
}
