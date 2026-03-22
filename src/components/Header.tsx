import { Grape, Sun, CloudRain, Wind, LogIn, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading, login, logout } = useAuth();

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

          {/* Icone decorative e Auth */}
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
            
            <div className="w-px h-6 bg-white/20 mx-2 hidden md:block"></div>
            
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium hidden md:inline">{user.displayName || user.email}</span>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/20 hover:text-white">
                    <LogOut className="h-4 w-4 mr-2" />
                    Esci
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={login} className="text-white hover:bg-white/20 hover:text-white">
                  <LogIn className="h-4 w-4 mr-2" />
                  Accedi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
