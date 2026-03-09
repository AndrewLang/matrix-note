import { Component, computed, inject } from "@angular/core";
import { SettingsService } from "../../services/settings.service";

@Component({
  selector: "mtx-general-setting",
  templateUrl: "./general-setting.component.html"
})
export class GeneralSettingComponent {
  private readonly settingsService = inject(SettingsService);

  readonly isAutoSaveEnabled = computed(() => this.settingsService.autoSaveEnabled());

  setAutoSaveEnabled(enabled: boolean): void {
    this.settingsService.setAutoSaveEnabled(enabled);
  }
}
