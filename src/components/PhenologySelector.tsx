import { Leaf } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PHENOLOGICAL_STAGES } from '@/types';
import type { Location } from '@/types';
import { useSavedLocations } from '@/hooks/useSavedLocations';

interface PhenologySelectorProps {
  location: Location;
}

export function PhenologySelector({ location }: PhenologySelectorProps) {
  const { updateLocation, isSaved } = useSavedLocations();

  const handleStageChange = async (stage: string) => {
    if (!isSaved(location)) return;
    
    const updatedLocation = { ...location, phenologicalStage: stage };
    await updateLocation(location, updatedLocation);
  };

  if (!isSaved(location)) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm">
      <div className="p-2 bg-green-100 text-green-700 rounded-lg">
        <Leaf className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Fase Fenologica</p>
        <Select 
          value={location.phenologicalStage || ''} 
          onValueChange={handleStageChange}
        >
          <SelectTrigger className="h-8 border-0 bg-transparent p-0 focus:ring-0 shadow-none font-semibold text-sm">
            <SelectValue placeholder="Seleziona la fase attuale" />
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
  );
}
