import { useState } from 'react';
import { Droplets, Plus, Trash2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useIrrigations } from '@/hooks/useIrrigations';
import type { Location, WeatherData } from '@/types';

interface IrrigationManagerProps {
  location: Location;
  weather: WeatherData;
}

export function IrrigationManager({ location, weather }: IrrigationManagerProps) {
  const { irrigations, loading, addIrrigation, removeIrrigation } = useIrrigations(location.name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    
    const isoDate = new Date(date).toISOString();

    await addIrrigation({
      locationName: location.name,
      date: isoDate,
      amount: parseFloat(amount),
      notes
    });

    setAmount('');
    setNotes('');
    setIsAdding(false);
  };

  // Calculate Irrigation Advice
  const soilMoisture = weather.current.soilMoisture10to28cm ?? 0.3; // fallback
  const upcomingRain = weather.daily.slice(0, 3).reduce((acc, day) => acc + day.precipitation, 0);
  const stage = location.phenologicalStage;

  let status: 'good' | 'caution' | 'bad' = 'good';
  let message = 'Umidità ottimale.';
  let action = 'Non è necessario irrigare.';

  if (soilMoisture < 0.15) {
    status = 'bad';
    message = 'Forte stress idrico rilevato.';
    action = 'Irrigazione di soccorso fortemente consigliata per evitare danni alla pianta.';
  } else if (soilMoisture < 0.25) {
    status = 'caution';
    message = 'Umidità in diminuzione.';
    action = 'Valuta l\'irrigazione in base alla fase fenologica.';
    
    if (stage === 'Invaiatura' || stage === 'Maturazione') {
      action = 'Un lieve stress idrico in questa fase è utile per la qualità (concentrazione zuccheri). Non irrigare se non scende ulteriormente.';
      status = 'good'; // Actually good for this stage
    } else if (stage === 'Allegagione' || stage === 'Chiusura grappolo') {
      action = 'Fase critica per il fabbisogno idrico. Consigliata irrigazione moderata.';
      status = 'bad'; // Bad to have stress here
    }
  }

  if (upcomingRain > 10 && status !== 'good') {
    action += ` Attenzione: previsti ${upcomingRain.toFixed(1)}mm di pioggia nei prossimi 3 giorni. Attendi prima di irrigare.`;
    status = 'caution';
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'caution': return <AlertTriangle className="h-6 w-6 text-amber-500" />;
      case 'bad': return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'caution': return 'bg-amber-50 border-amber-200';
      case 'bad': return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
          <Droplets className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold">Gestione Irrigazione</h3>
      </div>

      {/* Advice Card */}
      <div className={`p-4 rounded-lg border ${getStatusColor()} flex gap-4 items-start`}>
        <div className="mt-1">{getStatusIcon()}</div>
        <div>
          <h4 className="font-semibold text-foreground">{message}</h4>
          <p className="text-sm text-muted-foreground mt-1">{action}</p>
          <div className="flex items-center gap-4 mt-3 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Umidità suolo: {(soilMoisture * 100).toFixed(0)}%
            </span>
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Pioggia (3gg): {upcomingRain.toFixed(1)}mm
            </span>
          </div>
        </div>
      </div>

      {/* Registry */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Storico Irrigazioni</h4>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAdding(!isAdding)}
            className="gap-2 h-8"
          >
            <Plus className="h-3 w-3" />
            Nuova
          </Button>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 bg-muted/50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data</label>
                <Input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantità (mm o litri/pianta)</label>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="es. 15" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Note (opzionale)</label>
              <Input 
                type="text" 
                placeholder="Metodo, durata, ecc." 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
              <Button type="submit">Salva</Button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">Caricamento...</div>
        ) : irrigations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
            Nessuna irrigazione registrata.
          </div>
        ) : (
          <div className="space-y-2">
            {irrigations.map((irrigation) => (
              <div key={irrigation.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-700">{irrigation.amount} mm/l</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(irrigation.date).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                  {irrigation.notes && (
                    <p className="text-xs text-muted-foreground">{irrigation.notes}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => irrigation.id && removeIrrigation(irrigation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
