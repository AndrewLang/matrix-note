import { NgClass } from "@angular/common";
import { Component, signal } from "@angular/core";
import { SvgComponent } from "../../shared/svg/svg.component";

type SettingsTab = "general" | "appearance" | "editor" | "about";

@Component({
  selector: "mtx-settings",
  imports: [NgClass, SvgComponent],
  templateUrl: "./settings.component.html"
})
export class SettingsComponent {
  readonly activeTab = signal<SettingsTab>("general");

  readonly tabs: Array<{ id: SettingsTab; label: string; bottom?: boolean }> = [
    { id: "general", label: "General" },
    { id: "appearance", label: "Appearance" },
    { id: "editor", label: "Editor" },
    { id: "about", label: "About", bottom: true }
  ];

  selectTab(tab: SettingsTab): void {
    this.activeTab.set(tab);
  }
}
