import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, computed, inject, signal } from "@angular/core";
import { EditableDocument } from "../models/document";
import { SettingNames } from "../models/setting.names";
import { Note } from "../models/note";
import { NoteService } from "./note.service";
import { SettingsService } from "./settings.service";

@Injectable({
  providedIn: "root"
})
export class WorkspaceService {
  private readonly noteService = inject(NoteService);
  private readonly settingsService = inject(SettingsService);
  private readonly autoSaveDelayMs = 750;
  private readonly autoSaveTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly isBrowser: boolean;

  readonly tabs = signal<EditableDocument[]>([]);
  readonly activeTabId = signal<number | null>(null);
  readonly activeTab = computed(() =>
    this.tabs().find((tab) => tab.id === this.activeTabId()) ?? null
  );

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  selectTab(id: number): void {
    this.activeTabId.set(id);
    this.persistWorkspaceState();
  }

  openNote(noteId: number): void {
    const existingTab = this.tabs().find((tab) => tab.id === noteId);
    if (existingTab) {
      this.activeTabId.set(existingTab.id);
      this.persistWorkspaceState();
      return;
    }

    const note = this.noteService.getNoteById(noteId);
    if (!note) {
      return;
    }

    const document = this.toEditableDocument(note);
    this.tabs.update((tabs) => [...tabs, document]);
    this.activeTabId.set(document.id);
    this.persistWorkspaceState();
  }

  createNoteTab(): Promise<void> {
    return this.createAndOpenNoteTab();
  }

  closeTab(id: number): void {
    const current = this.tabs();
    const index = current.findIndex((tab) => tab.id === id);
    if (index === -1) {
      return;
    }

    const next = current.filter((tab) => tab.id !== id);
    this.tabs.set(next);

    if (this.activeTabId() !== id) {
      this.persistWorkspaceState();
      return;
    }

    if (next.length === 0) {
      this.activeTabId.set(null);
      this.persistWorkspaceState();
      return;
    }

    const fallbackIndex = Math.max(0, index - 1);
    this.activeTabId.set(next[fallbackIndex].id);
    this.persistWorkspaceState();
  }

  updateDocument(document: EditableDocument): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => (tab.id === document.id ? document : tab))
    );
    this.noteService.updateNoteContent(document.id, document.content);
    if (!this.settingsService.autoSaveEnabled()) {
      return;
    }
    this.scheduleAutoSave(document.id);
  }

  renameDocument(noteId: number, title: string): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => (tab.id === noteId ? { ...tab, title } : tab))
    );
    this.persistWorkspaceState();
  }

  restoreSession(): void {
    const savedTabIds = this.readSetting<number[]>(SettingNames.workspaceOpenTabIdsKey) ?? [];
    const savedActiveTabId = this.readSetting<number | null>(SettingNames.workspaceActiveTabIdKey);

    const restoredTabs = savedTabIds
      .map((noteId) => this.noteService.getNoteById(noteId))
      .filter((note): note is Note => note !== undefined)
      .map((note) => this.toEditableDocument(note));

    this.tabs.set(restoredTabs);

    const hasSavedActiveTab = savedActiveTabId !== null
      && restoredTabs.some((tab) => tab.id === savedActiveTabId);
    this.activeTabId.set(
      hasSavedActiveTab
        ? savedActiveTabId
        : (restoredTabs[0]?.id ?? null)
    );

    this.persistWorkspaceState();
  }

  private async createAndOpenNoteTab(): Promise<void> {
    try {
      const note = await this.noteService.createNote();
      this.openNote(note.id);
    } catch (error) {
      console.error("Failed to create note.", error);
    }
  }

  private toEditableDocument(note: Note): EditableDocument {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      isDirty: false
    };
  }

  private scheduleAutoSave(noteId: number): void {
    const existingTimer = this.autoSaveTimers.get(noteId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.autoSaveTimers.delete(noteId);
      void this.saveDocument(noteId);
    }, this.autoSaveDelayMs);

    this.autoSaveTimers.set(noteId, timer);
  }

  private async saveDocument(noteId: number): Promise<void> {
    const tab = this.tabs().find((currentTab) => currentTab.id === noteId);
    const note = this.noteService.getNoteById(noteId);
    if (!tab || !note) {
      return;
    }

    const contentAtSaveStart = tab.content;

    try {
      await this.noteService.updateNote({
        ...note,
        content: contentAtSaveStart,
        updatedAt: Date.now()
      });

      this.tabs.update((tabs) =>
        tabs.map((currentTab) =>
          currentTab.id === noteId && currentTab.content === contentAtSaveStart
            ? { ...currentTab, isDirty: false }
            : currentTab
        )
      );
    } catch (error) {
      console.error(`Failed to auto-save note ${noteId}.`, error);
    }
  }

  private persistWorkspaceState(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(
      SettingNames.workspaceOpenTabIdsKey,
      JSON.stringify(this.tabs().map((tab) => tab.id))
    );
    localStorage.setItem(
      SettingNames.workspaceActiveTabIdKey,
      JSON.stringify(this.activeTabId())
    );
  }

  private readSetting<T>(key: string): T | null {
    if (!this.isBrowser) {
      return null;
    }

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
}
