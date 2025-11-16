# Plan: Emoji per sang

## Oversikt
Hver sang skal ha en unik emoji som vises:
- Helt til venstre på sang-kortet i biblioteket (omtrent like høy som kortet)
- I midten av hovedknappen når sangen spilles av

## 1. Datastruktur
- Legg til `emoji`-felt i hver sang i `manifest.json`:
  ```json
  {
    "display": "Alma og Silas",
    "id": "Alma_og-Silas",
    "emoji": "👶",
    ...
  }
  ```

## 2. Script for emoji-generering
- Opprett `scripts/generate-emojis.mjs` som:
  - Leser `manifest.json`
  - For hver sang uten emoji:
    - Analyserer `display`, `id`, `category` for å foreslå emoji
    - Sjekker at emojien ikke allerede er brukt
    - Lagrer emojien i manifestet
  - Validerer unikhet (ingen duplikater)
  - Skriver tilbake til `manifest.json`

## 3. Manifest.js oppdatering
- Oppdater `sanitizeFile()` i `assets/js/manifest.js` til å bevare `emoji`-feltet:
  ```javascript
  emoji: typeof entry.emoji === "string" ? entry.emoji.trim() : null,
  ```

## 4. UI-endringer

### A. Library-item (biblioteket)
- Oppdater `renderLibraryList()` i `assets/js/app.js`:
  - Legg til emoji-element helt til venstre på sangkortet
  - CSS: `.library-item` endres fra `grid-template-columns: 1fr auto auto` til `grid-template-columns: auto 1fr auto auto`
  - Ny CSS-klasse `.library-item__emoji`:
    ```css
    .library-item__emoji {
      font-size: 2rem; /* Omtrent like høy som kortet */
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    ```

### B. Hovedknapp (big-btn)
- Oppdater `updateButtonColor()` eller legg til ny funksjon i `assets/js/app.js`:
  - Når en sang spilles, vis emojien i midten av knappen
  - Oppdater `playClipResult()` for å sette emojien på knappen
- CSS: `.big-btn` har allerede `display: grid; place-items: center;`
  - Legg til emoji-element inni knappen når den spiller
  - CSS-klasse `.big-btn__emoji`:
    ```css
    .big-btn__emoji {
      font-size: clamp(2rem, 8vw, 4rem);
      line-height: 1;
      pointer-events: none;
    }
    ```

## 5. Import-guide oppdatering
- Oppdater `docs/import-guide.md`:
  - Legg til steg 4.5: "Generate emoji data" etter color-generering
  - Instruksjoner for AI-agenter:
    - Analyser sanginfo (`display`, `id`, `category`) for å foreslå passende emoji
    - Sjekk at emojien ikke allerede er brukt
    - Kjør `node scripts/generate-emojis.mjs` etter å ha lagt til nye sanger

## 6. Implementasjonsdetaljer

### Emoji-valgstrategi
- Bruk `display`-navn, `id` og `category` for å foreslå emoji
- Eksempler:
  - "Alma og Silas" → 👶 eller 👨‍👩‍👧
  - "Alma som danser" → 💃 eller 🎵
  - "Dancing in the Moonlight" → 🌙 eller 💃
  - "Dyredans med Farger" → 🦋 eller 🎨
- Unikhetssjekk: lagre brukte emojier i et Set og sjekk før tildeling

### Script-struktur (`generate-emojis.mjs`)
```javascript
// Pseudokode struktur:
1. Les manifest.json
2. Lag Set med allerede brukte emojier
3. For hver sang uten emoji:
   a. Analyser sanginfo
   b. Foreslå emoji basert på navn/kategori
   c. Sjekk unikhet
   d. Hvis ikke unik, prøv alternativer
   e. Lagre emoji i manifest
4. Skriv tilbake til manifest.json
```

## 7. Filendringer oversikt

**Nye filer:**
- `scripts/generate-emojis.mjs` - Script for å generere emojier

**Endrede filer:**
- `assets/sounds/almabuzz/manifest.json` - Legg til `emoji`-felt per sang
- `assets/js/manifest.js` - Bevar `emoji` i `sanitizeFile()`
- `assets/js/app.js` - Legg til emoji i library-item og hovedknapp
- `assets/css/style.css` - Styling for emoji-elementer
- `docs/import-guide.md` - Legg til emoji-generering i prosessen

## 8. Testplan
1. Kjør `generate-emojis.mjs` på eksisterende sanger
2. Verifiser at alle sanger får unike emojier
3. Test at emojier vises i biblioteket
4. Test at emojien vises i hovedknappen når sangen spilles
5. Test at emojien oppdateres når man bytter sang

