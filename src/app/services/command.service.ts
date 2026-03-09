import { Injectable } from "@angular/core";
import { ViewOrientation, ViewOrientations } from "@app/models/uistates";
import { invoke } from "@tauri-apps/api/core";
import { Command } from "../models/command";

export interface SidebarCommandHandlers {
  createNote: () => void;
  createFolder: () => void;
  toggleSidebar: () => void;
}

export interface WorkspaceNoteCommandHandlers {
  toggleEditor: () => void;
  togglePreview: () => void;
  showPreviewOnRight: () => void;
  showPreviewOnTop: () => void;
}

@Injectable({
  providedIn: "root"
})
export class CommandService {
  createSidebarCommands(handlers: SidebarCommandHandlers): Command[] {
    return [
      {
        id: 1,
        name: "New Note",
        description: "Create a new note at the top level",
        icon: "circlePlus",
        action: handlers.createNote
      },
      {
        id: 2,
        name: "New Folder",
        description: "Create a new folder at the top level",
        icon: "folderSolid",
        action: handlers.createFolder
      },
      {
        id: 3,
        name: "Toggle",
        description: "Collapse or expand the sidebar",
        icon: "menu",
        action: handlers.toggleSidebar
      }
    ];
  }

  createWorkspaceNoteCommands(
    handlers: WorkspaceNoteCommandHandlers,
    state: {
      showPreview: boolean;
      showEditor: boolean;
      previewPlacement: ViewOrientation
    }
  ): Command[] {
    return [
      {
        id: 100,
        name: "Toggle Editor",
        description: "Toggle the editor view",
        icon: "editor",
        active: state.showEditor,
        action: handlers.toggleEditor
      },
      {
        id: 101,
        name: "Toggle Preview",
        description: state.showPreview ? "Hide preview" : "Show preview",
        icon: "preview",
        active: state.showPreview,
        action: handlers.togglePreview
      },
      {
        id: 102,
        name: "Preview Right",
        description: "Show preview on the right",
        icon: "panelRight",
        active: state.previewPlacement === ViewOrientations.Horizontal,
        action: handlers.showPreviewOnRight
      },
      {
        id: 103,
        name: "Preview Top",
        description: "Show preview on top",
        icon: "panelTop",
        active: state.previewPlacement === ViewOrientations.Vertical,
        action: handlers.showPreviewOnTop
      }
    ];
  }


  async invokeCommand(commandName: string, args?: Record<string, unknown>): Promise<unknown> {
    try {
      return await invoke(commandName, args);
    } catch (error) {
      console.error(`Failed to invoke command ${commandName}`, error);
      throw error;
    }
  }
}
