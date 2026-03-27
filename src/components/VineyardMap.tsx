import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon } from 'lucide-react';

interface VineyardMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

export const VineyardMap: React.FC<VineyardMapProps> = ({ latitude, longitude, name }) => {
  // Utilizziamo l'embed di Google Maps senza necessità di API key per visualizzazione base
  // t=k attiva la vista satellite
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <Card className="overflow-hidden border-none shadow-md bg-white/50 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapIcon className="h-5 w-5 text-primary" />
          Mappa del Vigneto: {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[400px] bg-muted">
          <iframe
            title={`Mappa di ${name}`}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            marginHeight={0}
            marginWidth={0}
            src={mapUrl}
            className="rounded-b-xl"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm border">
            Coordinate: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
