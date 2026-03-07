import { Injectable, computed, inject, signal } from "@angular/core";
import { EditableDocument } from "../models/document";
import { Note } from "../models/note";
import { NoteService } from "./note-service";

@Injectable({
  providedIn: "root"
})
export class WorkspaceService {
  private readonly noteService = inject(NoteService);

  readonly tabs = signal<EditableDocument[]>(this.createInitialTabs());
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

  createNoteTab(): void {
    const note = this.noteService.createNote();
    this.openNote(note.id);
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
  }

  private createInitialTabs(): EditableDocument[] {
    return [3, 4]
      .map((noteId) => this.noteService.getNoteById(noteId))
      .filter((note): note is Note => note !== undefined)
      .map((note) => this.toEditableDocument(note));
  }

  private toEditableDocument(note: Note): EditableDocument {
    return {
      id: note.id,
      title: note.title,
      content: note.content,
      isDirty: false
    };
  }
}
