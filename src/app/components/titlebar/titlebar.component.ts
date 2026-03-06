import { DOCUMENT } from "@angular/common";
import { Component, EventEmitter, Output, inject, signal } from "@angular/core";
import { SvgComponent } from "../../shared/svg/svg.component";

type TauriWindowApi = {
  close?: () => Promise<void> | void;
  minimize?: () => Promise<void> | void;
  toggleMaximize?: () => Promise<void> | void;
};

type TauriGlobal = {
  window?: {
    getCurrentWindow?: () => TauriWindowApi;
  };
};

@Component({
  selector: "app-titlebar",
  standalone: true,
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
    await this.getCurrentWindow()?.minimize?.();
  }

  async toggleMaximizeWindow(): Promise<void> {
    await this.getCurrentWindow()?.toggleMaximize?.();
  }

  async closeWindow(): Promise<void> {
    await this.getCurrentWindow()?.close?.();
  }

  private getCurrentWindow(): TauriWindowApi | null {
    if (typeof window === "undefined") {
      return null;
    }

    const tauri = (window as Window & { __TAURI__?: TauriGlobal }).__TAURI__;
    return tauri?.window?.getCurrentWindow?.() ?? null;
  }
}
