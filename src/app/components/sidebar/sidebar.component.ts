import { Component, inject } from "@angular/core";
import { Command } from "../../models/command";
import { CommandService } from "../../services/command-service";
import { NoteService } from "../../services/note-service";
import { UiStateService } from "../../services/ui-state.service";
import { SidebarActionsComponent } from "./sidebar.actions.component";
import { TreeComponent } from "../tree/tree.component";

@Component({
  selector: "mtx-sidebar",
  standalone: true,
  imports: [SidebarActionsComponent, TreeComponent],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  private readonly commandService = inject(CommandService);
  private readonly noteService = inject(NoteService);
  private readonly uiStateService = inject(UiStateService);

  readonly isCollapsed = this.uiStateService.isSidebarCollapsed;
  readonly nodes = this.noteService.treeNodes;
  readonly commands: Command[] = this.commandService.createSidebarCommands({
    createNote: () => this.createNote(),
    createFolder: () => this.createFolder(),
    toggleSidebar: () => this.toggleSidebar()
  });

  createNote(): void {
    this.noteService.createNote();
  }

  createFolder(): void {
    this.noteService.createCategory();
  }

  toggleSidebar(): void {
    this.uiStateService.toggleSidebar();
  }
}
