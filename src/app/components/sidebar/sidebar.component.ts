import { Component, computed, inject } from "@angular/core";
import { Command } from "../../models/command";
import { TreeNode } from "../../models/tree";
import { CommandService } from "../../services/command.service";
import { NoteService } from "../../services/note.service";
import { UiStateService } from "../../services/uistate.service";
import { WorkspaceService } from "../../services/workspace.service";
import { TreeComponent } from "../tree/tree.component";
import { SidebarActionsComponent } from "./sidebar.actions.component";

@Component({
  selector: "mtx-sidebar",
  imports: [SidebarActionsComponent, TreeComponent],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  private readonly commandService = inject(CommandService);
  private readonly noteService = inject(NoteService);
  private readonly uiStateService = inject(UiStateService);
  private readonly workspaceService = inject(WorkspaceService);

  readonly isCollapsed = this.uiStateService.isSidebarCollapsed;
  readonly nodes = computed(() => this.bindDocumentSelection(this.noteService.treeNodes()));
  readonly commands: Command[] = this.commandService.createSidebarCommands({
    createNote: () => this.createNote(),
    createFolder: () => this.createFolder(),
    toggleSidebar: () => this.toggleSidebar()
  });

  createNote(): void {
    void this.workspaceService.createNoteTab();
  }

  createFolder(): void {
    void this.createCategory();
  }

  toggleSidebar(): void {
    this.uiStateService.toggleSidebar();
  }

  private async createCategory(): Promise<void> {
    try {
      await this.noteService.createCategory();
    } catch (error) {
      console.error("Failed to create category.", error);
    }
  }

  private bindDocumentSelection(nodes: TreeNode[]): TreeNode[] {
    return nodes.map((node) => {
      if (Array.isArray(node.children)) {
        return {
          ...node,
          onDrop: (draggedNode, targetNode) => this.handleDrop(draggedNode, targetNode),
          onRename: (targetNode, name) => this.renameNode(targetNode, name),
          children: this.bindDocumentSelection(node.children)
        };
      }

      return {
        ...node,
        onSelect: () => this.workspaceService.openNote(node.id),
        onRename: (targetNode, name) => this.renameNode(targetNode, name)
      };
    });
  }

  private async handleDrop(draggedNode: TreeNode, targetNode: TreeNode): Promise<void> {
    if (targetNode.type !== "category" || draggedNode.id === targetNode.id) {
      return;
    }

    try {
      if (draggedNode.type === "note") {
        await this.noteService.moveNote(draggedNode.id, targetNode.id);
        return;
      }

      await this.noteService.moveCategory(draggedNode.id, targetNode.id);
    } catch (error) {
      console.error("Failed to move sidebar node.", error);
    }
  }

  private async renameNode(node: TreeNode, name: string): Promise<void> {
    try {
      if (node.type === "note") {
        const note = await this.noteService.renameNote(node.id, name);
        this.workspaceService.renameDocument(node.id, note.title);
        return;
      }

      await this.noteService.renameCategory(node.id, name);
    } catch (error) {
      console.error("Failed to rename sidebar node.", error);
    }
  }
}
