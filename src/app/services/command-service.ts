import { Injectable } from "@angular/core";
import { Command } from "../models/command";

export interface SidebarCommandHandlers {
  createNote: () => void;
  createFolder: () => void;
  toggleSidebar: () => void;
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
}
