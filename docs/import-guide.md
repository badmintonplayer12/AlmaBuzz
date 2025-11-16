# AlmaBuzz Audio Import Guide

This guide helps automated agents (and humans) add new audio assets under `assets/sounds/almabuzz/` safely.

## Folder layout
- Base directory: `assets/sounds/almabuzz/`
- Licensed pack (current): `assets/sounds/almabuzz/NonCommerseLicense/`
- Manifest: `assets/sounds/almabuzz/manifest.json`

## Steps to add new files
1. **Copy files** into `assets/sounds/almabuzz/NonCommerseLicense/`.
2. **Normalize filenames** by running the rename script:
   ```
   node scripts/rename-sounds.mjs
   ```
   This enforces:
   - Spaces → `_`
   - Removes unsupported characters
   - Keeps uppercase letters
   - Lowercases extensions
3. **Update `manifest.json`**:
   - Each entry needs: `id`, `src`, `display`, `category`, `gain`, `etag`.
   - `id/src` should match the normalized filename (without extension).
   - `display` is the human-friendly label (keep spaces/special chars here).
   - `category` must be one of existing groups (e.g., `voice`, `jingle`, `music`).
   - `etag` equals the original filename/version identifier for cache busting.
4. **Generate color data** for new songs by running:
   ```
   node scripts/generate-colors.mjs
   ```
   This script:
   - Generates unique colors for any songs missing color data
   - Uses golden angle distribution for even color spread
   - Creates consistent colors per song (hue, saturation, lightness, bgAngle, radial positions)
   - Only updates songs that don't already have color data
5. **Generate emoji data** for new songs by running:
   ```
   node scripts/generate-emojis.mjs
   ```
   This script:
   - Generates unique emojis for any songs missing emoji data
   - Analyzes song info (`display`, `id`, `category`) to suggest appropriate emojis
   - Ensures no duplicate emojis across all songs
   - Only updates songs that don't already have emoji data
   - **Important**: After running the script, manually review the generated emojis to ensure they are appropriate and meaningful for each song. The script uses keyword matching which may not always produce the best match. Consider the song's theme, mood, and content when choosing emojis.
6. **Verify** in browser:
   - Run the app, open the library panel, check the new entries appear with correct display names.
   - Play each new clip once to ensure no decoding errors.
   - Verify that each song has its unique color on the button and background.
   - Verify that each song has its unique emoji displayed on the library card and in the main button when playing.

## Script details
- `scripts/rename-sounds.mjs` scans `NonCommerseLicense/` and renames files to safe slugs.
  - Only affects files whose names change; re-run whenever new audio is added.
  - After renaming, update `manifest.json` accordingly.
- `scripts/generate-colors.mjs` generates color data for songs in `manifest.json`.
  - Uses golden angle (137.508°) for even hue distribution.
  - Generates: hue, saturation, lightness, bgAngle, radial1Pos, radial2Pos.
  - Only adds colors to songs that don't already have them (safe to re-run).
  - Colors are deterministic based on song index and base hue.
- `scripts/generate-emojis.mjs` generates emoji data for songs in `manifest.json`.
  - Analyzes song information (`display`, `id`, `category`) to suggest appropriate emojis.
  - Ensures uniqueness: no two songs will have the same emoji.
  - Only adds emojis to songs that don't already have them (safe to re-run).
  - Uses keyword matching and fallback strategies to find suitable emojis.
  - **Note**: Always manually review and refine emoji choices after generation. The script's suggestions are a starting point, but emojis should be carefully chosen to match the song's theme, mood, and meaning. Consider what the song is about, not just keywords in the title.

## Notes for AI agents
- Never commit raw files with spaces or special characters—always run the script.
- Preserve original capitalization when constructing `display`.
- Keep existing ordering in `manifest.json` unless asked otherwise.
- Always run `generate-colors.mjs` after adding new songs to ensure they have color data.
- Always run `generate-emojis.mjs` after adding new songs to ensure they have unique emoji data.
- Existing tests (Vitest) should be run after manifest changes: `npm test`.
