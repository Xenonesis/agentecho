import type { StorageAdapter, PinmarkSettings } from '@pinmark/pinmark';
import type { PinmarkAnnotation } from '@pinmark/core';
import { getSettings, saveSettings, getFeedback, saveFeedback, clearFeedback } from '../shared/storage';

export class ChromeStorageAdapter implements StorageAdapter {
  async getSettings(): Promise<PinmarkSettings> {
    const settings = await getSettings();
    return settings as PinmarkSettings;
  }

  async saveSettings(settings: Partial<PinmarkSettings>): Promise<void> {
    await saveSettings(settings as any);
  }

  async getFeedback(url: string): Promise<PinmarkAnnotation[]> {
    return await getFeedback(url);
  }

  async saveFeedback(url: string, feedback: PinmarkAnnotation[]): Promise<void> {
    await saveFeedback(url, feedback);
  }

  async clearFeedback(url: string): Promise<void> {
    await clearFeedback(url);
  }
}
