# VignaMeteo - Istruzioni per l'esecuzione locale

Questo progetto è stato generato con Google AI Studio. Segui questi passaggi per eseguirlo sul tuo computer.

## Requisiti
- **Node.js**: Versione 18 o superiore (scaricabile da [nodejs.org](https://nodejs.org/))

## Installazione

1. Scarica e scompatta il file ZIP.
2. Apri il terminale nella cartella del progetto.
3. Installa le dipendenze:
   ```bash
   npm install
   ```

## Configurazione
L'app richiede una chiave API di Gemini per le funzioni di intelligenza artificiale.
1. Crea un file chiamato `.env` nella cartella principale.
2. Aggiungi la tua chiave in questo modo:
   ```env
   GEMINI_API_KEY=inserisci_qui_la_tua_chiave
   ```
   *Puoi ottenere una chiave gratuita su [aistudio.google.com](https://aistudio.google.com/app/apikey).*

## Avvio dell'applicazione

### Modalità Sviluppo
Per avviare l'app con ricarica automatica:
```bash
npm run dev
```
L'app sarà disponibile all'indirizzo `http://localhost:3000`.

### Modalità Produzione
Per creare una versione ottimizzata e avviarla:
```bash
npm run build
npm run start
```

## Note su Firebase
L'app è configurata per collegarsi al database Firebase creato durante lo sviluppo. Finché non modifichi il file `firebase-applet-config.json`, i dati verranno salvati e letti dallo stesso database online.
