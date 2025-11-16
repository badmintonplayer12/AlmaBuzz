#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

const MANIFEST_PATH = "assets/sounds/almabuzz/manifest.json";

// Emoji mapping based on keywords and patterns
function suggestEmoji(display, id, category) {
  const text = `${display} ${id}`.toLowerCase();
  
  // Keywords and their emoji suggestions
  const keywordMap = {
    // People and names
    "alma": "👶",
    "silas": "👨",
    "barn": "👶",
    "babe": "👶",
    "baby": "👶",
    "danser": "💃",
    "dance": "💃",
    "dancing": "💃",
    
    // Nature and animals
    "dyr": "🦋",
    "dyredans": "🦋",
    "skog": "🌲",
    "skogens": "🌲",
    "hemmeligheter": "🔮",
    "hemmelighet": "🔮",
    
    // Music and sounds
    "rumpa": "🎵",
    "rumpemannen": "🎸",
    "music": "🎵",
    "song": "🎵",
    
    // Moonlight and night
    "moonlight": "🌙",
    "moon": "🌙",
    "night": "🌙",
    
    // Colors
    "farger": "🎨",
    "color": "🎨",
    "farge": "🎨",
    
    // Disappearing/mystery
    "forsvant": "✨",
    "disappear": "✨",
    "vanished": "✨",
  };
  
  // Check for keywords
  for (const [keyword, emoji] of Object.entries(keywordMap)) {
    if (text.includes(keyword)) {
      return emoji;
    }
  }
  
  // Fallback based on category
  const categoryEmojis = {
    music: "🎵",
    voice: "🎤",
    jingle: "🔔",
    misc: "🎶",
  };
  
  return categoryEmojis[category] || "🎵";
}

// Alternative emojis if primary is taken
const emojiAlternatives = {
  "👶": ["👨‍👩‍👧", "👧", "👨", "👩"],
  "💃": ["🕺", "🎵", "🎶", "🎸"],
  "🌙": ["⭐", "✨", "🌃", "🌌"],
  "🦋": ["🐛", "🌺", "🌸", "🌼"],
  "🌲": ["🌳", "🌴", "🍃", "🌿"],
  "🔮": ["✨", "🌟", "💫", "⭐"],
  "🎵": ["🎶", "🎸", "🎹", "🎺"],
  "🎸": ["🎵", "🎶", "🎹", "🎤"],
  "🎨": ["🌈", "✨", "🌟", "💫"],
  "✨": ["🌟", "💫", "⭐", "🔮"],
};

function findUniqueEmoji(usedEmojis, display, id, category) {
  const primary = suggestEmoji(display, id, category);
  
  if (!usedEmojis.has(primary)) {
    return primary;
  }
  
  // Try alternatives
  const alternatives = emojiAlternatives[primary] || [];
  for (const alt of alternatives) {
    if (!usedEmojis.has(alt)) {
      return alt;
    }
  }
  
  // If all alternatives are taken, try common emojis
  const commonEmojis = ["🎵", "🎶", "🎸", "🎹", "🎺", "🎤", "🎧", "🎼", "🎻", "🥁", "🎪", "🎭", "🎨", "🎬", "🎯", "🎲", "🎰", "🎳", "🎴", "🃏", "🎴", "🀄", "🎲", "🎯", "🎪", "🎭", "🎨", "🎬"];
  for (const emoji of commonEmojis) {
    if (!usedEmojis.has(emoji)) {
      return emoji;
    }
  }
  
  // Last resort: use primary even if duplicate (shouldn't happen)
  console.warn(`Warning: Could not find unique emoji for ${display}, using ${primary} (may be duplicate)`);
  return primary;
}

async function generateEmojisForManifest() {
  const manifestContent = await fs.readFile(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(manifestContent);
  
  if (!manifest.files || !Array.isArray(manifest.files)) {
    console.error("Manifest has no files array");
    process.exit(1);
  }
  
  // Collect already used emojis
  const usedEmojis = new Set();
  manifest.files.forEach((file) => {
    if (file.emoji && typeof file.emoji === "string") {
      usedEmojis.add(file.emoji.trim());
    }
  });
  
  let updated = false;
  
  manifest.files.forEach((file) => {
    if (!file.emoji || typeof file.emoji !== "string" || !file.emoji.trim()) {
      const emoji = findUniqueEmoji(usedEmojis, file.display || "", file.id || "", file.category || "music");
      file.emoji = emoji;
      usedEmojis.add(emoji);
      updated = true;
      console.log(`Generated emoji for ${file.id}: ${emoji}`);
    } else {
      console.log(`Skipping ${file.id} (already has emoji: ${file.emoji})`);
    }
  });
  
  // Validate uniqueness
  const allEmojis = manifest.files.map(f => f.emoji).filter(Boolean);
  const uniqueEmojis = new Set(allEmojis);
  if (allEmojis.length !== uniqueEmojis.size) {
    console.error("ERROR: Duplicate emojis found!");
    const duplicates = allEmojis.filter((e, i) => allEmojis.indexOf(e) !== i);
    console.error("Duplicates:", duplicates);
    process.exit(1);
  }
  
  if (updated) {
    const updatedContent = JSON.stringify(manifest, null, 2) + "\n";
    await fs.writeFile(MANIFEST_PATH, updatedContent, "utf-8");
    console.log(`\n✓ Updated ${MANIFEST_PATH} with emoji data`);
    console.log(`✓ All ${manifest.files.length} songs have unique emojis`);
  } else {
    console.log("\n✓ All files already have emoji data");
  }
}

generateEmojisForManifest().catch((error) => {
  console.error("generate-emojis failed", error);
  process.exit(1);
});

