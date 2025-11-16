# Plan: Farge følger sangen

## Mål
Hver sang skal ha sin egen unike farge som:
- Vises på hovedknappen når sangen spilles
- Vises i bakgrunnen når sangen spilles
- Vises på sang-kortet i biblioteket

## Nåværende situasjon
- `updateButtonColor()` genererer tilfeldige farger ved hvert klikk
- Bruker golden angle (137.508°) for hue-generering
- Fargene settes på CSS custom properties
- Library items har ingen farge-visning

## Teknisk oversikt

### Farge-data som må lagres per sang
1. **Hovedfarge (knappen)**:
   - `hue` (0-360) - hovedfargen
   - `saturation` (80-90%) - metning
   - `lightness` (45-55%) - lyshet

2. **Bakgrunnsgradient**:
   - `bgAngle` (0-360°) - gradient vinkel

3. **Radiale effekters posisjoner**:
   - `radial1Pos` - "x% y%" format
   - `radial2Pos` - "x% y%" format

### Bakgrunnsfarger beregnes automatisk
Fra `hue` beregnes:
- `analogA = (hue + 30) % 360`
- `analogB = (hue + 330) % 360`
- `bg-tint-hue = (hue + 200) % 360`

## Implementeringsfaser

### Fase 1: Data-preparering ✅
- [x] Opprett `scripts/generate-colors.mjs`
  - Leser `manifest.json`
  - Genererer farge-data for sanger uten `color`
  - Bruker golden angle for jevn distribusjon
  - Lagrer tilbake i manifestet
- [x] Oppdater `docs/import-guide.md`
  - Legg til steg 4 for å kjøre `generate-colors.mjs` etter å ha lagt til nye sanger
  - Dokumenter scriptet i "Script details"-seksjonen
  - Legg til notat i "Notes for AI agents" om å alltid kjøre scriptet
- [x] Kjør scriptet første gang for å generere farger for alle eksisterende sanger

### Fase 2: Kode-endringer ✅
- [x] Oppdater `updateButtonColor(clip)` i `assets/js/app.js`
  - Endre fra å generere tilfeldig til å lese fra `clip.color`
  - Behold samme logikk for bakgrunnsfarger (beregnes fra hue)
  - Legg til fallback hvis `clip.color` mangler
- [x] Oppdater `playNext()` i `assets/js/app.js`
  - Send `clip` til `updateButtonColor(nextResult.clip)`
- [x] Oppdater `renderLibraryList()` i `assets/js/app.js`
  - Legg til farge-visning på hvert library-item
  - Bruk `file.color` for å sette CSS custom properties eller inline styles

### Fase 3: CSS-styling ✅
- [x] Legg til CSS for farge-visning på library items
  - Border-left med sangens farge
  - Smooth transitions

### Fase 4: Testing ✅
- [x] Test at hver sang får sin farge på knappen
- [x] Test at bakgrunnen endres med sangens farge
- [x] Test at library items viser riktig farge
- [x] Test fallback hvis en sang mangler farge-data (implementert i kode)
- [x] Test at fargene er konsistente ved reload (farger lagres i manifest)

## JSON-struktur i manifest.json

```json
{
  "display": "Alma og Silas",
  "id": "Alma_og-Silas",
  "src": "Alma_og-Silas",
  "category": "music",
  "gain": 0,
  "etag": "AlmaOgSilas-v1",
  "color": {
    "hue": 45,
    "saturation": 85,
    "lightness": 50,
    "bgAngle": 120,
    "radial1Pos": "35% 60%",
    "radial2Pos": "75% 25%"
  }
}
```

## Tekniske detaljer

### Farge-generering
- Bruker golden angle (137.508°) for jevn distribusjon av farger
- Starter fra base hue (tilfeldig ved første generering)
- Deterministisk basert på sangens indeks
- Safe to re-run: hopper over sanger som allerede har farge-data

### Backward compatibility
- Fallback til eksisterende logikk hvis `clip.color` mangler
- Eksisterende sanger uten farge-data fungerer fortsatt
- Gradvis migrering mulig

### Performance
- Farger lagres i manifestet (cached)
- Ingen runtime-generering nødvendig
- CSS custom properties er effektive

## Arbeidsflyt for nye sanger

1. Kopier lydfiler til `assets/sounds/almabuzz/NonCommerseLicense/`
2. Kjør `node scripts/rename-sounds.mjs`
3. Oppdater `manifest.json` med ny sang-entry (uten `color`)
4. Kjør `node scripts/generate-colors.mjs` (genererer farge for ny sang)
5. Verifiser i nettleseren

## Notater
- Fargene skal være konsistente - samme sang = samme farge
- Bakgrunnsfargene beregnes automatisk fra hovedfargen
- Library items skal visuelt indikere sangens farge
- Alle tilfeldige verdier (bgAngle, radial positions) lagres per sang

