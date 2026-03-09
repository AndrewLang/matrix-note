import { Component, EventEmitter, OnDestroy, Output, signal } from "@angular/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-titlebar",
  imports: [SvgComponent],
  templateUrl: "./titlebar.component.html"
})
export class TitlebarComponent {
  private static readonly githubUrl = "https://github.com/AndrewLang/matrix-note";
  private unlistenResize: UnlistenFn | null = null;
  readonly isMaximized = signal(false);
  @Output() readonly openSettings = new EventEmitter<void>();

  constructor() {
    if (typeof window === "undefined") {
      return;
    }
    void this.bindWindowState();
  }

  ngOnDestroy(): void {
    this.unlistenResize?.();
  }

  requestSettingsOpen(): void {
    this.openSettings.emit();
  }

  openGithub(): void {
    window.open(TitlebarComponent.githubUrl, "_blank", "noopener,noreferrer");
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
