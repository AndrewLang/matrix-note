import { Injectable, inject, signal } from "@angular/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { DialogMessageComponent } from "../components/dialog/dialog-message.component";
import { CustomizeNodeComponent } from "../components/dialog/customize.node.component";
import { Command } from "../models/command";
import {
  ContextMenuPayload,
  ContextMenuState,
  ContextMenuTargetType,
  ContextMenuTargetTypes
} from "../models/context-menu";
import { EditableDocument } from "../models/document";
import { TreeNode } from "../models/tree";
import { DialogService } from "./dialog.service";
import { NoteService } from "./note.service";
import { WorkspaceService } from "./workspace.service";

@Injectable({
  providedIn: "root"
})
export class ContextMenuService {
  private readonly dialogService = inject(DialogService);
  private readonly noteService = inject(NoteService);
  private readonly workspaceService = inject(WorkspaceService);

  readonly activeMenu = signal<ContextMenuState | null>(null);

  open(type: ContextMenuTargetType, payload: ContextMenuPayload, x: number, y: number): void {
    const items = this.getItems(type, payload);
    if (items.length === 0) {
      this.close();
      return;
    }

    this.activeMenu.set({ x, y, items });
  }

  close(): void {
    this.activeMenu.set(null);
  }

  run(item: Command): void {
    this.close();
    void item.action();
  }

  private getItems(type: ContextMenuTargetType, payload: ContextMenuPayload): Command[] {
    switch (type) {
      case ContextMenuTargetTypes.Category:
        return this.getCategoryItems(payload as TreeNode);
      case ContextMenuTargetTypes.NoteNode:
        return this.getNoteNodeItems(payload as TreeNode);
      case ContextMenuTargetTypes.Tab:
        return this.getTabItems(payload as EditableDocument);
      default:
        return [];
    }
  }

  private getCategoryItems(node: TreeNode): Command[] {
    return [
      {
        id: this.commandId(node.id, 1),
        name: "Rename",
        icon: "rename",
        action: async () => this.renameCategory(node.id, node.name)
      },
      {
        id: this.commandId(node.id, 2),
        name: "Export",
        icon: "export",
        action: async () => this.exportCategory(node.id, node.name)
      },
      {
        id: this.commandId(node.id, 3),
        name: "Customize",
        icon: "settings",
        action: async () => this.editCategoryAppearance(node)
      },
      {
        id: this.commandId(node.id, 4),
        name: "Remove",
        icon: "trash",
        description: "danger",
        action: () => this.confirmRemoveCategory(node.id, node.name)
      }
    ];
  }

  private getNoteNodeItems(node: TreeNode): Command[] {
    return [
      {
        id: this.commandId(node.id, 11),
        name: "Rename",
        icon: "rename",
        action: async () => this.renameNote(node.id, node.name)
      },
      {
        id: this.commandId(node.id, 12),
        name: "Export",
        icon: "export",
        action: async () => this.exportNote(node.id, node.name)
      },
      {
        id: this.commandId(node.id, 13),
        name: "Customize",
        icon: "settings",
        action: async () => this.editNoteAppearance(node)
      },
      {
        id: this.commandId(node.id, 14),
        name: "Remove",
        icon: "trash",
        description: "danger",
        action: () => this.confirmRemoveNote(node.id, node.name)
      }
    ];
  }

  private getTabItems(tab: EditableDocument): Command[] {
    return [
      {
        id: this.commandId(tab.id, 21),
        name: "Rename",
        icon: "rename",
        action: async () => this.renameNote(tab.id, tab.title)
      },
      {
        id: this.commandId(tab.id, 22),
        name: "Close",
        icon: "close",
        action: () => this.confirmCloseTab(tab.id, tab.title)
      },
      {
        id: this.commandId(tab.id, 23),
        name: "Export",
        icon: "export",
        action: async () => this.exportNote(tab.id, tab.title)
      }
    ];
  }

  private async renameCategory(categoryId: number, currentName: string): Promise<void> {
    const name = window.prompt("Rename category", currentName)?.trim();
    if (!name || name === currentName) {
      return;
    }

    await this.noteService.renameCategory(categoryId, name);
  }

  private async renameNote(noteId: number, currentTitle: string): Promise<void> {
    const title = window.prompt("Rename note", currentTitle)?.trim();
    if (!title || title === currentTitle) {
      return;
    }

    const note = await this.noteService.renameNote(noteId, title);
    this.workspaceService.renameDocument(noteId, note.title);
  }

  private async exportCategory(categoryId: number, categoryName: string): Promise<void> {
    const destinationDir = await open({
      directory: true,
      multiple: false,
      defaultPath: categoryName
    });

    if (!destinationDir || Array.isArray(destinationDir)) {
      return;
    }

    await this.noteService.exportCategoryNotes(categoryId, destinationDir, true);
  }

  private async exportNote(noteId: number, noteTitle: string): Promise<void> {
    const destinationPath = await save({
      defaultPath: this.defaultNoteFileName(noteTitle),
      filters: [
        {
          name: "Markdown",
          extensions: ["md"]
        }
      ]
    });

    if (!destinationPath) {
      return;
    }

    await this.noteService.exportNote(noteId, this.ensureMarkdownExtension(destinationPath));
  }

  private async editCategoryAppearance(node: TreeNode): Promise<void> {
    this.dialogService.open(CustomizeNodeComponent, {
      title: "Category Appearance",
      closable: true,
      closeOnBackdrop: false,
      closeOnEscape: false,
      dialogClass: "max-w-[560px]",
      bodyClass: "overflow-hidden",
      componentInputs: {
        entityType: "category",
        entityId: node.id,
        entityName: node.name,
        initialIcon: node.icon,
        initialColor: node.color
      }
    });
  }

  private async editNoteAppearance(node: TreeNode): Promise<void> {
    this.dialogService.open(CustomizeNodeComponent, {
      title: "Note Appearance",
      closable: true,
      closeOnBackdrop: false,
      closeOnEscape: false,
      dialogClass: "max-w-[560px]",
      bodyClass: "overflow-hidden",
      componentInputs: {
        entityType: "note",
        entityId: node.id,
        entityName: node.name,
        initialIcon: node.icon,
        initialColor: node.color
      }
    });
  }

  private confirmRemoveCategory(categoryId: number, categoryName: string): void {
    this.dialogService.open(DialogMessageComponent, {
      title: "Remove category?",
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      dialogClass: "max-w-[440px]",
      componentInputs: {
        message: `Remove "${categoryName}"?`,
        description: "Notes inside the category will be kept and moved to the top level."
      },
      buttons: [
        {
          id: "cancel-remove-category",
          label: "Cancel",
          closesDialog: true
        },
        {
          id: "confirm-remove-category",
          label: "Remove",
          variant: "danger",
          closesDialog: true,
          onClick: () => void this.noteService.deleteCategory(categoryId)
        }
      ]
    });
  }

  private confirmRemoveNote(noteId: number, noteTitle: string): void {
    this.dialogService.open(DialogMessageComponent, {
      title: "Remove note?",
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      dialogClass: "max-w-[440px]",
      componentInputs: {
        message: `Remove "${noteTitle}"?`,
        description: "This note will be permanently deleted."
      },
      buttons: [
        {
          id: "cancel-remove-note",
          label: "Cancel",
          closesDialog: true
        },
        {
          id: "confirm-remove-note",
          label: "Remove",
          variant: "danger",
          closesDialog: true,
          onClick: () => {
            this.workspaceService.closeTab(noteId);
            void this.noteService.deleteNote(noteId);
          }
        }
      ]
    });
  }

  private confirmCloseTab(tabId: number, tabTitle: string): void {
    const tab = this.workspaceService.tabs().find((currentTab) => currentTab.id === tabId);
    if (!tab) {
      return;
    }

    if (!tab.isDirty) {
      this.workspaceService.closeTab(tabId);
      return;
    }

    this.dialogService.open(DialogMessageComponent, {
      title: "Discard changes?",
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      dialogClass: "max-w-[440px]",
      componentInputs: {
        message: `Close "${tabTitle}" without saving?`,
        description: "This document has unsaved changes. Closing the tab will discard them."
      },
      buttons: [
        {
          id: "cancel-close-tab",
          label: "Cancel",
          closesDialog: true
        },
        {
          id: "confirm-close-tab",
          label: "Close",
          variant: "danger",
          closesDialog: true,
          onClick: () => this.workspaceService.closeTab(tabId)
        }
      ]
    });
  }

  private commandId(entityId: number, actionId: number): number {
    return entityId * 100 + actionId;
  }

  private defaultNoteFileName(noteTitle: string): string {
    const trimmed = noteTitle.trim();
    if (!trimmed) {
      return "untitled.md";
    }

    return trimmed.toLowerCase().endsWith(".md") ? trimmed : `${trimmed}.md`;
  }

  private ensureMarkdownExtension(path: string): string {
    return path.toLowerCase().endsWith(".md") ? path : `${path}.md`;
  }
}
