import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Bot, Image as ImageIcon, Search, Loader2, Volume2, Beaker, ShieldCheck, Sparkles, Save, Trash2, History } from 'lucide-react';
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
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useTreatments } from '@/hooks/useTreatments';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface GroundingLink {
  uri: string;
  title?: string;
}

export function AIAssistant() {
  const { savedLocations } = useSavedLocations();
  const { treatments } = useTreatments();
  const { advices, addAdvice, removeAdvice } = useAIAdvice();

  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    return new GoogleGenAI({ apiKey });
  };

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

  // State for Consigli Personalizzati
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceResult, setAdviceResult] = useState('');

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
      const response = await getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: meteoQuery,
        config: {
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
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
      const response = await getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prodottiQuery,
        config: {
          systemInstruction: "Sei un esperto agronomo specializzato in viticoltura. Quando consigli prodotti commerciali, specifica sempre se è necessario il 'patentino' (certificato di abilitazione all'acquisto e all'utilizzo dei prodotti fitosanitari) o se sono di libera vendita (PFnPE o PFnPO). Fornisci nomi commerciali reali e aggiornati disponibili sul mercato italiano.",
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
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
      
      const response = await getAI().models.generateContent({
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

  const handleGeneratePersonalizedAdvice = async () => {
    setIsGeneratingAdvice(true);
    setAdviceResult('');
    try {
      const context = `
        Vigneti salvati: ${savedLocations.map(l => `${l.name} (${l.region}, fase: ${l.phenologicalStage || 'N/D'})`).join(', ')}
        Ultimi trattamenti: ${treatments.slice(0, 5).map(t => `${t.date}: ${t.product} a ${t.locationName}`).join(', ')}
      `;

      const response = await getAI().models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Basandoti sui miei vigneti e trattamenti recenti, dammi dei consigli agronomici personalizzati per i prossimi giorni. Considera le fasi fenologiche e suggerisci eventuali interventi preventivi o curativi. Sii conciso e usa Markdown.`,
        config: {
          systemInstruction: `Sei un consulente agronomico digitale esperto. Ecco il contesto dell'utente: ${context}. Fornisci consigli pratici, tecnici e tempestivi.`,
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });
      setAdviceResult(response.text || 'Nessun consiglio disponibile al momento.');
    } catch (error) {
      console.error(error);
      setAdviceResult('Errore durante la generazione dei consigli.');
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  const handleSaveAdvice = async (title: string, content: string, type: 'meteo' | 'prodotti' | 'analisi' | 'generale') => {
    try {
      await addAdvice({
        title,
        content,
        date: new Date().toISOString(),
        type
      });
      toast.success('Consiglio salvato con successo!');
    } catch (error) {
      console.error(error);
      toast.error('Errore durante il salvataggio.');
    }
  };

  const playAudio = async (text: string) => {
    if (!text) return;
    setIsSpeaking(true);
    try {
      const response = await getAI().models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
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
      toast.error('Errore durante la generazione vocale.');
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
            Consulenza agronomica personalizzata, analisi foto e ricerca prodotti.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="consigli" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="consigli" className="flex items-center gap-2 text-[10px] px-1">
                <Sparkles className="h-3 w-3" />
                Consigli
              </TabsTrigger>
              <TabsTrigger value="meteo" className="flex items-center gap-2 text-[10px] px-1">
                <Search className="h-3 w-3" />
                Meteo
              </TabsTrigger>
              <TabsTrigger value="prodotti" className="flex items-center gap-2 text-[10px] px-1">
                <Beaker className="h-3 w-3" />
                Prodotti
              </TabsTrigger>
              <TabsTrigger value="analisi" className="flex items-center gap-2 text-[10px] px-1">
                <ImageIcon className="h-3 w-3" />
                Analisi
              </TabsTrigger>
              <TabsTrigger value="storia" className="flex items-center gap-2 text-[10px] px-1">
                <History className="h-3 w-3" />
                Storia
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-6">
            <TabsContent value="consigli" className="mt-0 space-y-4">
              <div className="bg-green-50 border border-green-100 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Consigli Personalizzati
                </h3>
                <p className="text-xs text-green-700">
                  Genera un'analisi basata sui tuoi vigneti salvati e sui trattamenti recenti.
                </p>
                <Button 
                  onClick={handleGeneratePersonalizedAdvice} 
                  disabled={isGeneratingAdvice}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  {isGeneratingAdvice ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Genera Consigli
                </Button>
              </div>

              {adviceResult && (
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm text-green-800">Analisi IA:</h4>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSaveAdvice('Consiglio Personalizzato', adviceResult, 'generale')}
                        className="h-8 px-2 text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => playAudio(adviceResult)}
                        disabled={isSpeaking}
                        className="h-8 px-2 text-green-700"
                      >
                        {isSpeaking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{adviceResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </TabsContent>

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
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSaveAdvice('Meteo: ' + meteoQuery, meteoResult, 'meteo')}
                        className="h-8 px-2 text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
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
                  </div>
                  <div className="text-sm prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{meteoResult}</ReactMarkdown>
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
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleSaveAdvice('Prodotti: ' + prodottiQuery, prodottiResult, 'prodotti')}
                        className="h-8 px-2 text-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
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
                  </div>
                  <div className="text-sm prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{prodottiResult}</ReactMarkdown>
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
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSaveAdvice('Analisi Foto', analisiResult, 'analisi')}
                          className="h-8 px-2 text-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
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
                    </div>
                    <div className="text-sm prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown>{analisiResult}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="storia" className="mt-0 space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Consigli Salvati
                </h3>
                {advices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Non hai ancora salvato alcun consiglio.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {advices.map((advice) => (
                      <div key={advice.id} className="bg-muted p-4 rounded-lg space-y-2 border border-border">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-sm text-green-800">{advice.title}</h4>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(advice.date).toLocaleDateString()} - {advice.type}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => playAudio(advice.content)}
                              disabled={isSpeaking}
                              className="h-8 px-2 text-green-700"
                            >
                              <Volume2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => advice.id && removeAdvice(advice.id)}
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs prose prose-sm max-w-none text-foreground line-clamp-3 overflow-hidden">
                          <ReactMarkdown>{advice.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
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
