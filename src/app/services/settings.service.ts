import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, effect, inject, signal } from "@angular/core";
import { SettingNames } from "../models/setting.names";

export const AppThemes = {
  Light: "light",
  Dark: "dark"
} as const;

export type AppTheme = typeof AppThemes[keyof typeof AppThemes];

export const AiProviders = {
  OpenAI: "openai",
  Anthropic: "anthropic",
  Google: "google"
} as const;

export type AiProvider = typeof AiProviders[keyof typeof AiProviders];

@Injectable({
  providedIn: "root"
})
export class SettingsService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser: boolean;

  readonly appTheme = signal<AppTheme>(AppThemes.Light);
  readonly autoSaveEnabled = signal(true);
  readonly aiProvider = signal<AiProvider>(AiProviders.OpenAI);
  readonly aiApiKey = signal("");

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (!this.isBrowser) {
      return;
    }

    this.appTheme.set(this.readSetting<AppTheme>(SettingNames.appThemeKey) ?? AppThemes.Light);
    this.autoSaveEnabled.set(this.readSetting<boolean>(SettingNames.autoSaveEnabledKey) ?? true);
    this.aiProvider.set(this.readSetting<AiProvider>(SettingNames.aiProviderKey) ?? AiProviders.OpenAI);
    this.aiApiKey.set(this.readSetting<string>(SettingNames.aiApiKeyKey) ?? "");

    effect(() => {
      this.applyTheme(this.appTheme());
    });
  }

  setAppTheme(theme: AppTheme): void {
    this.appTheme.set(theme);
    this.writeSetting(SettingNames.appThemeKey, theme);
  }

  setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled.set(enabled);
    this.writeSetting(SettingNames.autoSaveEnabledKey, enabled);
  }

  setAiProvider(provider: AiProvider): void {
    this.aiProvider.set(provider);
    this.writeSetting(SettingNames.aiProviderKey, provider);
  }

  setAiApiKey(apiKey: string): void {
    this.aiApiKey.set(apiKey);
    this.writeSetting(SettingNames.aiApiKeyKey, apiKey);
  }

  private applyTheme(theme: AppTheme): void {
    this.document.documentElement.classList.toggle("dark", theme === AppThemes.Dark);
  }

  private readSetting<T>(key: string): T | null {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return null;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return null;
    }
  }

  private writeSetting<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
