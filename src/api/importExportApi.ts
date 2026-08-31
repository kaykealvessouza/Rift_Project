import { request } from './client.js';
import { ImportResult } from '../types/index.js';

export const importExportApi = {
  importCollection(text: string): Promise<ImportResult> {
    return request<ImportResult>('/import/collection', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  exportCollection(): Promise<{ text: string }> {
    return request<{ text: string }>('/export/collection');
  },

  exportDeck(id: number): Promise<{ text: string }> {
    return request<{ text: string }>(`/decks/${id}/export`);
  }
};
