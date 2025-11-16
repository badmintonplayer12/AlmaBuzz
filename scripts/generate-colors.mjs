#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const MANIFEST_PATH = "assets/sounds/almabuzz/manifest.json";
const GOLDEN_ANGLE = 137.508;

function generateColor(index, baseHue = 0) {
  const hue = (baseHue + index * GOLDEN_ANGLE) % 360;
  const saturation = Math.floor(80 + Math.random() * 10); // 80-90
  const lightness = Math.floor(45 + Math.random() * 10); // 45-55
  const bgAngle = Math.floor(Math.random() * 360);
  
  // Radial positions: 10-90% for both x and y
  const radial1X = Math.floor(10 + Math.random() * 80);
  const radial1Y = Math.floor(10 + Math.random() * 80);
  const radial2X = Math.floor(10 + Math.random() * 80);
  const radial2Y = Math.floor(10 + Math.random() * 80);
  
  return {
    hue,
    saturation,
    lightness,
    bgAngle,
    radial1Pos: `${radial1X}% ${radial1Y}%`,
    radial2Pos: `${radial2X}% ${radial2Y}%`
  };
}

async function generateColorsForManifest() {
  const manifestContent = await fs.readFile(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(manifestContent);
  
  if (!manifest.files || !Array.isArray(manifest.files)) {
    console.error("Manifest has no files array");
    process.exit(1);
  }
  
  // Use a consistent base hue (or random for first run)
  const baseHue = Math.floor(Math.random() * 360);
  let updated = false;
  
  manifest.files.forEach((file, index) => {
    // Only generate color if it doesn't exist
    if (!file.color) {
      file.color = generateColor(index, baseHue);
      updated = true;
      console.log(`Generated color for ${file.id}:`, file.color);
    } else {
      console.log(`Skipping ${file.id} (already has color)`);
    }
  });
  
  if (updated) {
    // Write back with proper formatting
    const updatedContent = JSON.stringify(manifest, null, 2) + "\n";
    await fs.writeFile(MANIFEST_PATH, updatedContent, "utf-8");
    console.log(`\n✓ Updated ${MANIFEST_PATH} with color data`);
  } else {
    console.log("\n✓ All files already have color data");
  }
}

generateColorsForManifest().catch((error) => {
  console.error("generate-colors failed", error);
  process.exit(1);
});

