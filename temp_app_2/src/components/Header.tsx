import { Grape, Sun, CloudRain, Wind } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-green-800 via-green-700 to-green-600 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e titolo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
              <div className="relative p-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                <Grape className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">VignaMeteo</h1>
              <p className="text-green-100 text-sm">Previsioni per Trattamenti in Vigna</p>
            </div>
          </div>

          {/* Icone decorative */}
          <div className="flex items-center gap-6 text-green-100">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Temperatura</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Precipitazioni</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5" />
              <span className="text-sm hidden sm:inline">Vento</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
