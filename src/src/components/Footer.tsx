import { Grape, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Grape className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">VignaMeteo</h3>
              </div>
            </div>
            <p className="text-green-200 text-sm leading-relaxed">
              Strumento professionale per viticoltori che fornisce previsioni meteorologiche 
              dettagliate e indici specifici per ottimizzare i trattamenti in vigna.
            </p>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informazioni
            </h4>
            <ul className="space-y-2 text-sm text-green-200">
              <li>
                <span className="font-medium text-white">Dati meteo:</span> Open-Meteo API
              </li>
              <li>
                <span className="font-medium text-white">Aggiornamento:</span> Ogni ora
              </li>
              <li>
                <span className="font-medium text-white">Previsioni:</span> Fino a 7 giorni
              </li>
              <li>
                <span className="font-medium text-white">Copertura:</span> Globale
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-semibold mb-4">Note Importanti</h4>
            <p className="text-sm text-green-200 leading-relaxed">
              Gli indici di rischio e le raccomandazioni fornite sono indicativi e basati 
              esclusivamente su dati meteorologici. Si consiglia sempre di consultare un 
              tecnico agronomo per decisioni importanti.
            </p>
          </div>
        </div>

        <div className="border-t border-green-700 mt-8 pt-6 text-center text-sm text-green-300">
          <p>© {new Date().getFullYear()} VignaMeteo - Previsioni Meteorologiche per la Viticoltura</p>
        </div>
      </div>
    </footer>
  );
}
