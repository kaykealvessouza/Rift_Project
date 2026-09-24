import fs from 'fs';

async function fetchAllCards() {
  console.log('Fetching all cards from RiftScribe API (https://riftscribe.gg/api)...');
  const allCards = [];
  let offset = 0;
  const pageSize = 100;

  while (true) {
    console.log(`Fetching batch offset=${offset}...`);
    const res = await fetch(`https://riftscribe.gg/api/cards?limit=${pageSize}&offset=${offset}`);
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      break;
    }
    const batch = await res.json();
    if (!batch || batch.length === 0) break;
    allCards.push(...batch);
    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  console.log(`Fetched total ${allCards.length} cards from API.`);

  // Map to internal Card schema
  const mappedCards = allCards.map((response) => {
    return {
      id: response.id,
      name: response.name,
      setId: response.set_id || '',
      collectorNumber: response.collector_number ?? null,
      rarity: (response.rarity || 'COMMON').toUpperCase(),
      faction: response.faction
        ? response.faction.charAt(0).toUpperCase() + response.faction.slice(1).toLowerCase()
        : 'Neutral',
      type: (response.type || 'UNIT').toUpperCase(),
      variant: response.variant || null,
      orientation: response.orientation || 'portrait',
      power: response.stats?.power ?? null,
      energy: response.stats?.energy ?? null,
      might: response.stats?.might ?? null,
      description: response.description || null,
      flavorText: response.flavor_text || null,
      imageUrl: response.image || response.image_thumb?.large || response.image_thumb?.medium || null,
      imageSmall: response.image_thumb?.small || null,
      imageMedium: response.image_thumb?.medium || null,
      imageLarge: response.image_thumb?.large || null,
      imageBlurDataUrl: response.image_blur_data_url || null,
      banned: Boolean(response.is_banned)
    };
  });

  const fileContent = `// Catálogo oficial de cartas sincronizado da API RiftScribe (https://riftscribe.gg/api)
import { Card } from "./types.js";

export const CARD_CATALOG: Card[] = ${JSON.stringify(mappedCards, null, 2)};
`;

  fs.writeFileSync('backend/catalog.ts', fileContent, 'utf-8');
  console.log(`Successfully generated backend/catalog.ts with ${mappedCards.length} cards!`);
}

fetchAllCards().catch((err) => {
  console.error('Fatal error during catalog rebuild:', err);
  process.exit(1);
});
