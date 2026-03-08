import { DOCUMENT } from "@angular/common";
import { Component, EventEmitter, Output, inject, signal } from "@angular/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-titlebar",
  imports: [SvgComponent],
  templateUrl: "./titlebar.component.html"
})
export class TitlebarComponent {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);
  @Output() readonly openSettings = new EventEmitter<void>();

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.isDark.set(prefersDark);
    this.document.documentElement.classList.toggle("dark", prefersDark);
  }

  toggleTheme(): void {
    this.isDark.update((value) => {
      const next = !value;
      this.document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  requestSettingsOpen(): void {
    this.openSettings.emit();
  }

  async minimizeWindow(): Promise<void> {
    await getCurrentWindow().minimize();
  }

  async toggleMaximizeWindow(): Promise<void> {
    await getCurrentWindow().toggleMaximize();
  }

  async closeWindow(): Promise<void> {
    await getCurrentWindow().close();
  }
}
