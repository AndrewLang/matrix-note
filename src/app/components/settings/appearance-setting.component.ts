import { NgClass } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { AppTheme, AppThemes, SettingsService } from "../../services/settings.service";

@Component({
  selector: "mtx-appearance-setting",
  imports: [NgClass],
  templateUrl: "./appearance-setting.component.html"
})
export class AppearanceSettingComponent {
  private readonly settingsService = inject(SettingsService);

  readonly appThemes = AppThemes;
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
  readonly selectedTheme = computed(() => this.settingsService.appTheme());

  setTheme(theme: AppTheme): void {
    this.settingsService.setAppTheme(theme);
  }
}
