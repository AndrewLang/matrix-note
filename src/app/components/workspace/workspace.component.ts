import { NgClass } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { DialogMessageComponent } from "../dialog/dialog-message.component";
import { EditableDocument } from "../../models/document";
import { Note } from "../../models/note";
import { DialogService } from "../../services/dialog.service";
import { NoteService } from "../../services/note-service";
import { SvgComponent } from "../../shared/svg/svg.component";
import { WorkspaceTabComponent } from "./workspace-tab/workspace-tab.component";

@Component({
  selector: "mtx-workspace",
  standalone: true,
  imports: [NgClass, SvgComponent, WorkspaceTabComponent],
  host: {
    class: "flex-1 min-w-0 min-h-0 w-full h-full flex"
  },
  templateUrl: "./workspace.component.html"
})
export class WorkspaceComponent {
  private readonly dialogService = inject(DialogService);
  private readonly noteService = inject(NoteService);

  readonly tabs = signal<EditableDocument[]>(this.createInitialTabs());
  readonly activeTabId = signal<number | null>(this.tabs()[0]?.id ?? null);

  selectTab(id: number): void {
    this.activeTabId.set(id);
  }

  addTab(): void {
    const note = this.noteService.createNote();
    const document = this.toEditableDocument(note);

    this.tabs.update((tabs) => [...tabs, document]);
    this.activeTabId.set(document.id);
  }

  closeTab(id: number, event: MouseEvent): void {
    event.stopPropagation();
    const current = this.tabs();
    const tab = current.find((currentTab) => currentTab.id === id);
    if (!tab) {
      return;
    }

    if (tab.isDirty) {
      this.dialogService.open(DialogMessageComponent, {
        title: "Discard changes?",
        closable: true,
        closeOnBackdrop: true,
        closeOnEscape: true,
        dialogClass: "max-w-[440px]",
        componentInputs: {
          message: `Close "${tab.title}" without saving?`,
          description: "This document has unsaved changes. Closing the tab will discard them."
        },
        buttons: [
          {
            id: "cancel-close",
            label: "Cancel",
            closesDialog: true
          },
          {
            id: "discard-close",
            label: "Discard",
            variant: "danger",
            closesDialog: true,
            onClick: () => this.removeTab(id)
          }
        ]
      });
      return;
    }

    this.removeTab(id);
  }

  private removeTab(id: number): void {
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
