import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { ViewOrientation, ViewOrientations } from "@app/models/uistates";
import { SettingNames } from "../models/setting.names";

@Injectable({
  providedIn: "root"
})
export class UiStateService {
  readonly isSidebarCollapsed = signal(false);
  readonly isPreviewVisible = signal(true);
  readonly isEditorVisible = signal(false);
  readonly previewPlacement = signal<ViewOrientation>(ViewOrientations.Horizontal);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    this.isSidebarCollapsed.set(this.readSetting<boolean>(SettingNames.sidebarCollapsedKey) ?? false);
    this.isPreviewVisible.set(this.readSetting<boolean>(SettingNames.previewVisibleKey) ?? true);
    this.isEditorVisible.set(this.readSetting<boolean>(SettingNames.editorVisibleKey) ?? false);
    this.previewPlacement.set(this.readSetting<ViewOrientation>(SettingNames.previewPlacementKey) ?? ViewOrientations.Horizontal);
  }

  toggleSidebar(): void {
    let value = !this.isSidebarCollapsed();
    this.isSidebarCollapsed.set(value);
    this.writeSetting(SettingNames.sidebarCollapsedKey, value);
  }

  togglePreview(): void {
    const value = !this.isPreviewVisible();
    this.isPreviewVisible.set(value);
    this.writeSetting(SettingNames.previewVisibleKey, value);
  }

  toggleEditor(): void {
    const value = !this.isEditorVisible();
    this.isEditorVisible.set(value);
    this.writeSetting(SettingNames.editorVisibleKey, value);
  }

  setPreviewPlacement(orientation: ViewOrientation): void {
    this.previewPlacement.set(orientation);
    this.writeSetting(SettingNames.previewPlacementKey, orientation);
  }

  private readSetting<T>(key: string): T | null {
    const storedValue = localStorage.getItem(key);

    if (storedValue === null) {
      return null;
    }

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return null;
    }
  }

  private writeSetting<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
