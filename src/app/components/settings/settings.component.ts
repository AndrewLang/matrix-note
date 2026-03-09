import { NgClass } from "@angular/common";
import { Component, signal } from "@angular/core";
import { AboutSettingComponent } from "./about-setting.component";
import { AiSettingComponent } from "./ai-setting.component";
import { AppearanceSettingComponent } from "./appearance-setting.component";
import { GeneralSettingComponent } from "./general-setting.component";

type SettingsTab = "general" | "appearance" | "ai" | "about";

@Component({
  selector: "mtx-settings",
  imports: [AboutSettingComponent, AiSettingComponent, AppearanceSettingComponent, GeneralSettingComponent, NgClass],
  templateUrl: "./settings.component.html"
})
export class SettingsComponent {
  readonly activeTab = signal<SettingsTab>("general");

  readonly tabs: Array<{ id: SettingsTab; label: string; bottom?: boolean }> = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "ai", label: "AI" },
    { id: "about", label: "About", bottom: true }
  ];

  selectTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }
}
