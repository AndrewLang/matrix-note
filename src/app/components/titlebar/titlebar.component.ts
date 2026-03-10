import { NgClass } from "@angular/common";
import { Component, ElementRef, EventEmitter, HostListener, ViewChild, inject, Output, signal } from "@angular/core";
import { CommandService } from "@app/services/command.service";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Note } from "../../models/note";
import { NoteService } from "../../services/note.service";
import { WorkspaceService } from "../../services/workspace.service";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-titlebar",
  imports: [NgClass, SvgComponent],
  templateUrl: "./titlebar.component.html"
})
export class TitlebarComponent {
  private static readonly githubUrl = "https://github.com/AndrewLang/matrix-note";
  private commandService = inject(CommandService);
  private readonly noteService = inject(NoteService);
  private readonly workspaceService = inject(WorkspaceService);

  private unlistenResize: UnlistenFn | null = null;
  private searchRequestId = 0;
  readonly isMaximized = signal(false);
  readonly searchTerm = signal("");
  readonly isSearchOpen = signal(false);
  readonly searchResults = signal<Note[]>([]);
  readonly isSearching = signal(false);

  @ViewChild("searchContainer") private searchContainer?: ElementRef<HTMLDivElement>;
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

  async updateSearchTerm(event: Event): Promise<void> {
    const value = (event.target as HTMLInputElement).value;
    await this.setSearchTerm(value);
  }

  openSearch(): void {
    if (this.searchTerm().trim()) {
      this.isSearchOpen.set(true);
    }
  }

  openSearchResult(noteId: number): void {
    this.workspaceService.openNote(noteId);
    this.searchTerm.set("");
    this.searchResults.set([]);
    this.isSearchOpen.set(false);
  }

  openGithub(): void {
    void this.commandService.invokeCommand("open_link", { url: TitlebarComponent.githubUrl });
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

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    const container = this.searchContainer?.nativeElement;
    if (!container || container.contains(event.target as Node)) {
      return;
    }

    this.isSearchOpen.set(false);
  }

  private async setSearchTerm(value: string): Promise<void> {
    this.searchTerm.set(value);

    const keyword = value.trim();
    if (!keyword) {
      this.searchResults.set([]);
      this.isSearchOpen.set(false);
      this.isSearching.set(false);
      return;
    }

    this.isSearchOpen.set(true);
    this.isSearching.set(true);
    const requestId = ++this.searchRequestId;

    try {
      const results = await this.noteService.searchNotes(keyword);
      if (requestId !== this.searchRequestId) {
        return;
      }

      this.searchResults.set(results);
    } catch (error) {
      if (requestId !== this.searchRequestId) {
        return;
      }

      console.error("Failed to search notes.", error);
      this.searchResults.set([]);
    } finally {
      if (requestId === this.searchRequestId) {
        this.isSearching.set(false);
      }
    }
  }
}
