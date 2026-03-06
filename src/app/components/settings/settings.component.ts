import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, HostListener, Input, Output, signal } from "@angular/core";

type SettingsTab = "general" | "appearance" | "editor" | "about";

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  templateUrl: "./settings.component.html"
})
export class SettingsComponent {
  @Input({ required: true }) open = false;
  @Output() readonly close = new EventEmitter<void>();

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

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    if (this.open) {
      this.closeModal();
    }
  }
}
