import { Card, CardApiResponse } from '../types.js';

export class CardMapper {
  public static toCard(response: CardApiResponse): Card {
    const card: Card = {
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
      energy: response.stats?.energy ?? null,
      might: response.stats?.might ?? null,
      power: response.stats?.power ?? null,
      description: response.description || null,
      flavorText: response.flavor_text || null,
      imageUrl: response.image || response.image_thumb?.large || response.image_thumb?.medium || null,
      imageSmall: response.image_thumb?.small || null,
      imageMedium: response.image_thumb?.medium || null,
      imageLarge: response.image_thumb?.large || null,
      imageBlurDataUrl: response.image_blur_data_url || null,
      banned: Boolean(response.is_banned)
    };

    return card;
  }
}
