import { DOCUMENT } from "@angular/common";
import { Component, EventEmitter, OnDestroy, Output, inject, signal } from "@angular/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-titlebar",
  imports: [SvgComponent],
  templateUrl: "./titlebar.component.html"
})
export class TitlebarComponent {
  private readonly document = inject(DOCUMENT);
  private unlistenResize: UnlistenFn | null = null;
  readonly isDark = signal(false);
  readonly isMaximized = signal(false);
  @Output() readonly openSettings = new EventEmitter<void>();

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.isDark.set(prefersDark);
    this.document.documentElement.classList.toggle("dark", prefersDark);
    void this.bindWindowState();
  }

  ngOnDestroy(): void {
    this.unlistenResize?.();
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
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
    this.isMaximized.set(await appWindow.isMaximized());
  }

  async closeWindow(): Promise<void> {
    await getCurrentWindow().close();
  }

  private async bindWindowState(): Promise<void> {
    const appWindow = getCurrentWindow();
    this.isMaximized.set(await appWindow.isMaximized());
    this.unlistenResize = await appWindow.onResized(async () => {
      this.isMaximized.set(await appWindow.isMaximized());
    });
  }
}
