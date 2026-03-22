import { useState } from 'react';
import { Plus, NotebookPen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTreatments } from '@/hooks/useTreatments';
import type { Location } from '@/types';

interface TreatmentRegistryProps {
  location: Location;
}

export function TreatmentRegistry({ location }: TreatmentRegistryProps) {
  const { treatments, loading, addTreatment, removeTreatment } = useTreatments(location.name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [product, setProduct] = useState('');
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !date) return;
    
    // Convert to ISO 8601 string
    const isoDate = new Date(date).toISOString();

    await addTreatment({
      locationName: location.name,
      date: isoDate,
      product,
      notes
    });

    setProduct('');
    setNotes('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-700 rounded-lg">
            <NotebookPen className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">Registro Trattamenti</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuovo
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
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
              <label className="text-sm font-medium">Prodotto / Principio Attivo</label>
              <Input 
                type="text" 
                placeholder="es. Rame, Zolfo..." 
                value={product} 
                onChange={(e) => setProduct(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (opzionale)</label>
            <Input 
              type="text" 
              placeholder="Dosi, condizioni meteo, ecc." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Annulla</Button>
            <Button type="submit">Salva Trattamento</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-4 text-muted-foreground">Caricamento...</div>
      ) : treatments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
          Nessun trattamento registrato per questa vigna.
        </div>
      ) : (
        <div className="space-y-3">
          {treatments.map((treatment) => (
            <div key={treatment.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{treatment.product}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(treatment.date).toLocaleDateString('it-IT')}
                  </span>
                </div>
                {treatment.notes && (
                  <p className="text-sm text-muted-foreground">{treatment.notes}</p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => treatment.id && removeTreatment(treatment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
