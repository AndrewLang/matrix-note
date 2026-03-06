import { DOCUMENT } from "@angular/common";
import { Component, inject, signal } from "@angular/core";

@Component({
  selector: "app-titlebar",
  standalone: true,
  templateUrl: "./titlebar.component.html"
})
export class TitlebarComponent {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);

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
}
