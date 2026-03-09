import { Injectable, computed, inject, signal } from "@angular/core";
import { EditableDocument } from "../models/document";
import { Note } from "../models/note";
import { NoteService } from "./note.service";

@Injectable({
  providedIn: "root"
})
export class WorkspaceService {
  private readonly noteService = inject(NoteService);
  private readonly autoSaveDelayMs = 750;
  private readonly autoSaveTimers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly tabs = signal<EditableDocument[]>([]);
  readonly activeTabId = signal<number | null>(this.tabs()[0]?.id ?? null);
  readonly activeTab = computed(() =>
    this.tabs().find((tab) => tab.id === this.activeTabId()) ?? null
  );

  selectTab(id: number): void {
    this.activeTabId.set(id);
  }

  openNote(noteId: number): void {
    const existingTab = this.tabs().find((tab) => tab.id === noteId);
    if (existingTab) {
      this.activeTabId.set(existingTab.id);
      return;
    }

    const note = this.noteService.getNoteById(noteId);
    if (!note) {
      return;
    }

    const document = this.toEditableDocument(note);
    this.tabs.update((tabs) => [...tabs, document]);
    this.activeTabId.set(document.id);
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
      return;
    }

    if (next.length === 0) {
      this.activeTabId.set(null);
      return;
    }

    const fallbackIndex = Math.max(0, index - 1);
    this.activeTabId.set(next[fallbackIndex].id);
  }

  updateDocument(document: EditableDocument): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => (tab.id === document.id ? document : tab))
    );
    this.noteService.updateNoteContent(document.id, document.content);
    this.scheduleAutoSave(document.id);
  }

  renameDocument(noteId: number, title: string): void {
    this.tabs.update((tabs) =>
      tabs.map((tab) => (tab.id === noteId ? { ...tab, title } : tab))
    );
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
}
