import { Inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root"
})
export class UiStateService {
  private static readonly sidebarCollapsedKey = "mtx.ui.sidebar.collapsed";

  readonly isSidebarCollapsed = signal(false);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    this.isSidebarCollapsed.set(this.readSidebarCollapsed());
  }

  toggleSidebar(): void {
    this.setSidebarCollapsed(!this.isSidebarCollapsed());
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.isSidebarCollapsed.set(collapsed);
    localStorage.setItem(UiStateService.sidebarCollapsedKey, JSON.stringify(collapsed));
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
}
