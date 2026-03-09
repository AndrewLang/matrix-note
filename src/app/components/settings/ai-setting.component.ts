import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AiProvider, AiProviders, SettingsService } from "../../services/settings.service";

@Component({
  selector: "mtx-ai-setting",
  imports: [FormsModule, CommonModule],
  templateUrl: "./ai-setting.component.html"
})
export class AiSettingComponent {
  private readonly settingsService = inject(SettingsService);

  readonly chevronRight = input<string>('0.75rem');
  readonly chevronSize = input<number>(18);

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
  readonly selectedAiProvider = computed(() => this.settingsService.aiProvider());
  readonly aiApiKey = computed(() => this.settingsService.aiApiKey());

  setAiProvider(provider: AiProvider): void {
    this.settingsService.setAiProvider(provider);
  }

  setAiApiKey(apiKey: string): void {
    this.settingsService.setAiApiKey(apiKey);
  }
}
