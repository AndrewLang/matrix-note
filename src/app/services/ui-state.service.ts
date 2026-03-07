import { Inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class UiStateService {
  private static readonly sidebarCollapsedKey = "mtx.ui.sidebar.collapsed";
  private static readonly previewVisibleKey = "mtx.ui.preview.visible";
  private static readonly previewPlacementKey = "mtx.ui.preview.placement";

  readonly isSidebarCollapsed = signal(false);
  readonly isPreviewVisible = signal(true);
  readonly previewPlacement = signal<"right" | "top">("right");

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    this.isSidebarCollapsed.set(this.readSidebarCollapsed());
    this.isPreviewVisible.set(this.readPreviewVisible());
    this.previewPlacement.set(this.readPreviewPlacement());
  }

  toggleSidebar(): void {
    this.setSidebarCollapsed(!this.isSidebarCollapsed());
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
    localStorage.setItem(UiStateService.sidebarCollapsedKey, JSON.stringify(collapsed));
  }

  togglePreview(): void {
    this.setPreviewVisible(!this.isPreviewVisible());
  }

  setPreviewVisible(visible: boolean): void {
    this.isPreviewVisible.set(visible);
    localStorage.setItem(UiStateService.previewVisibleKey, JSON.stringify(visible));
  }

  setPreviewPlacement(placement: "right" | "top"): void {
    this.previewPlacement.set(placement);
    localStorage.setItem(UiStateService.previewPlacementKey, placement);
  }

  private readSidebarCollapsed(): boolean {
    const storedValue = localStorage.getItem(UiStateService.sidebarCollapsedKey);

    if (storedValue === null) {
      return false;
    }

    try {
      return JSON.parse(storedValue) === true;
    } catch {
      return false;
    }
  }

  private readPreviewVisible(): boolean {
    const storedValue = localStorage.getItem(UiStateService.previewVisibleKey);

    if (storedValue === null) {
      return true;
    }

    try {
      return JSON.parse(storedValue) !== false;
    } catch {
      return true;
    }
  }

  private readPreviewPlacement(): "right" | "top" {
    return localStorage.getItem(UiStateService.previewPlacementKey) === "top" ? "top" : "right";
  }
}
