import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Bot, Image as ImageIcon, Search, Loader2, Volume2, Beaker, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GroundingLink {
  uri: string;
  title?: string;
}

export function AIAssistant() {
  // State for Meteo
  const [meteoQuery, setMeteoQuery] = useState('Previsioni meteo per i vigneti in Toscana questa settimana');
  const [meteoResult, setMeteoResult] = useState('');
  const [meteoLinks, setMeteoLinks] = useState<GroundingLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State for Prodotti
  const [prodottiQuery, setProdottiQuery] = useState('Consiglia trattamenti per peronospora con prodotti commerciali (anche con patentino)');
  const [prodottiResult, setProdottiResult] = useState('');
  const [prodottiLinks, setProdottiLinks] = useState<GroundingLink[]>([]);
  const [isSearchingProdotti, setIsSearchingProdotti] = useState(false);

  // State for Analisi
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analisiQuery, setAnalisiQuery] = useState('Analizza questa foglia di vite e dimmi se ci sono segni di malattie.');
  const [analisiResult, setAnalisiResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for TTS
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helpers
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSearch = async () => {
    if (!meteoQuery) return;
    setIsSearching(true);
    setMeteoResult('');
    setMeteoLinks([]);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: meteoQuery,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      setMeteoResult(response.text || 'Nessun risultato trovato.');
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks.map((c) => c.web).filter((web): web is GroundingLink => !!web);
        setMeteoLinks(links);
      }
    } catch (error) {
      console.error(error);
      setMeteoResult('Errore durante la ricerca.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProdottiSearch = async () => {
    if (!prodottiQuery) return;
    setIsSearchingProdotti(true);
    setProdottiResult('');
    setProdottiLinks([]);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prodottiQuery,
        config: {
          systemInstruction: "Sei un esperto agronomo specializzato in viticoltura. Quando consigli prodotti commerciali, specifica sempre se è necessario il 'patentino' (certificato di abilitazione all'acquisto e all'utilizzo dei prodotti fitosanitari) o se sono di libera vendita (PFnPE o PFnPO). Fornisci nomi commerciali reali e aggiornati disponibili sul mercato italiano.",
          tools: [{ googleSearch: {} }]
        }
      });
      setProdottiResult(response.text || 'Nessun risultato trovato.');
      
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks.map((c) => c.web).filter((web): web is GroundingLink => !!web);
        setProdottiLinks(links);
      }
    } catch (error) {
      console.error(error);
      setProdottiResult('Errore durante la ricerca dei prodotti.');
    } finally {
      setIsSearchingProdotti(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile || !analisiQuery) return;
    setIsAnalyzing(true);
    setAnalisiResult('');
    try {
      const base64Full = await fileToBase64(imageFile);
      const base64Data = base64Full.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: imageFile.type } },
            { text: analisiQuery }
          ]
        }
      });
      setAnalisiResult(response.text || 'Nessuna analisi disponibile.');
    } catch (error) {
      console.error(error);
      setAnalisiResult("Errore durante l'analisi dell'immagine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          }
        }
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        } else {
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          audio.play();
        }
      }
    } catch (error) {
      console.error(error);
      alert('Errore durante la generazione vocale.');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          size="lg" 
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-green-700 hover:bg-green-800 text-white z-50"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 bg-green-700 text-white pb-6">
          <SheetTitle className="text-white flex items-center gap-2 text-xl">
            <Bot className="h-6 w-6" />
            Assistente IA Vigna
          </SheetTitle>
          <SheetDescription className="text-green-100">
            Consulenza agronomica, analisi foto e ricerca prodotti commerciali.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="meteo" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="meteo" className="flex items-center gap-2 text-xs">
                <Search className="h-3 w-3" />
                Meteo
              </TabsTrigger>
              <TabsTrigger value="prodotti" className="flex items-center gap-2 text-xs">
                <Beaker className="h-3 w-3" />
                Prodotti
              </TabsTrigger>
              <TabsTrigger value="analisi" className="flex items-center gap-2 text-xs">
                <ImageIcon className="h-3 w-3" />
                Analisi
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="meteo" className="mt-0 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cosa vuoi cercare?</label>
                <div className="flex gap-2">
                  <Input 
                    value={meteoQuery}
                    onChange={(e) => setMeteoQuery(e.target.value)}
                    placeholder="Es. Previsioni pioggia a Montalcino..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching} className="bg-green-700 hover:bg-green-800">
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {meteoResult && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-green-800">Risultato:</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => playAudio(meteoResult)}
                      disabled={isSpeaking}
                      className="h-8 px-2 text-green-700"
                    >
                      {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-foreground">
                    {meteoResult}
                  </div>
                  {meteoLinks.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">Fonti:</h5>
                      <ul className="space-y-1">
                        {meteoLinks.map((link, idx) => (
                          <li key={idx}>
                            <a href={link.uri} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline line-clamp-1">
                              {link.title || link.uri}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="prodotti" className="mt-0 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-800 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <label className="text-sm font-semibold">Consulenza Prodotti Commerciali</label>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Chiedi consigli su prodotti specifici, dosaggi e requisiti di patentino.
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={prodottiQuery}
                    onChange={(e) => setProdottiQuery(e.target.value)}
                    placeholder="Es. Prodotti per oidio senza patentino..."
                    onKeyDown={(e) => e.key === 'Enter' && handleProdottiSearch()}
                  />
                  <Button onClick={handleProdottiSearch} disabled={isSearchingProdotti} className="bg-green-700 hover:bg-green-800">
                    {isSearchingProdotti ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {prodottiResult && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-green-800">Consigli Prodotti:</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => playAudio(prodottiResult)}
                      disabled={isSpeaking}
                      className="h-8 px-2 text-green-700"
                    >
                      {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-foreground prose prose-sm max-w-none">
                    {prodottiResult}
                  </div>
                  {prodottiLinks.length > 0 && (
                    <div className="pt-3 border-t border-border">
                      <h5 className="text-xs font-semibold text-muted-foreground mb-2">Fonti e Schede Tecniche:</h5>
                      <ul className="space-y-1">
                        {prodottiLinks.map((link, idx) => (
                          <li key={idx}>
                            <a href={link.uri} target="_blank" rel="noreferrer" className="text-xs text-green-600 hover:underline line-clamp-1">
                              {link.title || link.uri}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analisi" className="mt-0 space-y-4">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-md object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-sm">Tocca per caricare una foto</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Domanda sull'immagine</label>
                  <Textarea 
                    value={analisiQuery}
                    onChange={(e) => setAnalisiQuery(e.target.value)}
                    placeholder="Es. Ci sono segni di peronospora?"
                    className="resize-none"
                  />
                </div>

                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imageFile}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Analizza Foto
                </Button>

                {analisiResult && (
                  <div className="bg-muted p-4 rounded-lg space-y-3 mt-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm text-green-800">Analisi:</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => playAudio(analisiResult)}
                        disabled={isSpeaking}
                        className="h-8 px-2 text-green-700"
                      >
                        {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-foreground">
                      {analisiResult}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
