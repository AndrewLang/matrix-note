import { NgClass } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SvgComponent } from "../../shared/svg/svg.component";
import {
  AiProvider,
  AiProviders,
  AppTheme,
  AppThemes,
  SettingsService
} from "../../services/settings.service";

type SettingsTab = "general" | "appearance" | "ai" | "about";

@Component({
  selector: "mtx-settings",
  imports: [FormsModule, NgClass, SvgComponent],
  templateUrl: "./settings.component.html"
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);

  readonly activeTab = signal<SettingsTab>("general");
  readonly appThemes = AppThemes;
  readonly aiProviders = AiProviders;
  readonly themeOptions: Array<{ value: AppTheme; label: string; description: string }> = [
    {
      value: AppThemes.Light,
      label: "Light",
      description: "Bright surfaces with soft contrast for daytime use."
    },
    {
      value: AppThemes.Dark,
      label: "Dark",
      description: "Low-glare dark surfaces for focused night work."
    }
  ];
  readonly aiProviderOptions: Array<{ value: AiProvider; label: string; description: string }> = [
    {
      value: AiProviders.OpenAI,
      label: "OpenAI",
      description: "Use OpenAI-compatible models and API keys."
    },
    {
      value: AiProviders.Anthropic,
      label: "Anthropic",
      description: "Use Anthropic Claude models through their API."
    },
    {
      value: AiProviders.Google,
      label: "Google",
      description: "Use Google Gemini models through Google AI APIs."
    }
  ];
  readonly selectedTheme = computed(() => this.settingsService.appTheme());
  readonly isAutoSaveEnabled = computed(() => this.settingsService.autoSaveEnabled());
  readonly selectedAiProvider = computed(() => this.settingsService.aiProvider());
  readonly aiApiKey = computed(() => this.settingsService.aiApiKey());

  readonly tabs: Array<{ id: SettingsTab; label: string; bottom?: boolean }> = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "ai", label: "AI" },
    { id: "about", label: "About", bottom: true }
  ];

  selectTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }

  setTheme(theme: AppTheme): void {
    this.settingsService.setAppTheme(theme);
  }

  setAutoSaveEnabled(enabled: boolean): void {
    this.settingsService.setAutoSaveEnabled(enabled);
  }

  setAiProvider(provider: AiProvider): void {
    this.settingsService.setAiProvider(provider);
  }

  setAiApiKey(apiKey: string): void {
    this.settingsService.setAiApiKey(apiKey);
  }
}
