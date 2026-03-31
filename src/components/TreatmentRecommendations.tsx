import { CheckCircle, Clock, AlertTriangle, SprayCan, Bug, Leaf, Beaker, Info, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { TreatmentRecommendation } from '@/types';

interface TreatmentRecommendationsProps {
  recommendations: TreatmentRecommendation[];
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Trattamento Fungicida': SprayCan,
  'Trattamento Insetticida': Bug,
  'Concimazione Fogliare': Leaf
};

export function TreatmentRecommendations({ recommendations }: TreatmentRecommendationsProps) {
  const openAIAssistant = () => {
    // Trigger the AI Assistant sheet opening
    const botButton = document.querySelector('button.fixed.bottom-6.right-6') as HTMLButtonElement;
    if (botButton) {
      botButton.click();
      // We might need a small delay to let the sheet open before switching tabs
      setTimeout(() => {
        const prodottiTab = document.querySelector('[value="prodotti"]') as HTMLButtonElement;
        if (prodottiTab) prodottiTab.click();
      }, 100);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600/10 to-blue-500/5">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Raccomandazioni Trattamenti
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-4">
          {recommendations.map((rec, index) => {
            const IconComponent = typeIcons[rec.type] || SprayCan;
            
            return (
              <div 
                key={index}
                className={`p-5 rounded-xl border-2 transition-all hover:shadow-md ${
                  rec.suitable 
                    ? 'bg-green-50/50 border-green-200 hover:border-green-300' 
                    : 'bg-red-50/50 border-red-200 hover:border-red-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${rec.suitable ? 'bg-green-100' : 'bg-red-100'}`}>
                    <IconComponent className={`h-6 w-6 ${rec.suitable ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="font-semibold text-lg">{rec.type}</h4>
                      <Badge 
                        variant={rec.suitable ? 'default' : 'destructive'}
                        className={rec.suitable ? 'bg-green-600 hover:bg-green-700' : ''}
                      >
                        {rec.suitable ? '✓ Consigliato' : '✗ Non consigliato'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Condizioni:</p>
                        <ul className="space-y-1">
                          {rec.conditions.map((condition, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <span className="text-xs">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 p-2 bg-background/80 rounded-lg">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm"><strong>Orario consigliato:</strong> {rec.bestTime}</span>
                      </div>

                      {rec.suggestedProducts && rec.suggestedProducts.length > 0 && (
                        <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Beaker className="h-4 w-4 text-blue-600" />
                              <p className="text-sm font-bold text-blue-800 uppercase tracking-tight">Prodotti Consigliati</p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 gap-1"
                              onClick={openAIAssistant}
                            >
                              <Sparkles className="h-3 w-3" />
                              Chiedi all'IA
                            </Button>
                          </div>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                            {rec.suggestedProducts.map((product, i) => (
                              <li key={i} className="text-sm text-blue-700 flex items-center gap-1">
                                <span className="h-1 w-1 bg-blue-400 rounded-full" />
                                {product}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {rec.applicationMethod && (
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Modalità di Applicazione</p>
                          <p className="text-sm text-slate-700">{rec.applicationMethod}</p>
                        </div>
                      )}

                      {rec.fertilizationAdvice && (
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="h-4 w-4 text-green-600" />
                            <p className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Consiglio Nutrizionale</p>
                          </div>
                          <p className="text-sm text-green-800 italic">{rec.fertilizationAdvice}</p>
                        </div>
                      )}

                      {rec.warnings.length > 0 && (
                        <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Attenzione:</p>
                            <ul className="space-y-1">
                              {rec.warnings.map((warning, i) => (
                                <li key={i} className="text-sm text-yellow-700">{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
