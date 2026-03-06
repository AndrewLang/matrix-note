import { Component, signal } from "@angular/core";
import { Command } from "../../models/command";
import { TreeNode } from "../../models/tree";
import { SidebarActionsComponent } from "./sidebar.actions.component";
import { TreeComponent } from "../tree/tree.component";

@Component({
  selector: "mtx-sidebar",
  standalone: true,
  imports: [SidebarActionsComponent, TreeComponent],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  readonly isCollapsed = signal(false);
  readonly nodes = signal<TreeNode[]>([
    {
      id: 1,
      name: "Projects",
      icon: "folderSolid",
      color: "text-blue-500",
      isExpanded: true,
      children: [
        {
          id: 2,
          name: "Aero Redesign",
          icon: "folderOutline",
          color: "text-sky-500",
          isExpanded: true,
          children: [
            { id: 3, name: "Architecture.md", icon: "document" },
            { id: 4, name: "Design-System.md", icon: "document" },
            { id: 5, name: "Assets/", icon: "cloud" }
          ]
        },
        {
          id: 6,
          name: "API Gateway V2",
          icon: "folderOutline",
          color: "text-sky-500",
          isExpanded: true,
          children: [
            { id: 7, name: "routes.rs", icon: "circlePlus", color: "text-[#e34c26]" },
            { id: 8, name: "middleware.rs", icon: "circlePlus", color: "text-[#e34c26]" },
            { id: 9, name: "README.md", icon: "document" }
          ]
        }
      ]
    },
    {
      id: 10,
      name: "Personal Notes",
      icon: "folderSolid",
      color: "text-emerald-500",
      isExpanded: true,
      children: [
        { id: 11, name: "12-Oct-Sync.md", icon: "document" },
        { id: 12, name: "Todo-List.md", icon: "document" },
        { id: 13, name: "Archive", icon: "folderSolid", color: "text-rose-500" }
      ]
    },
    {
      id: 14,
      name: "Code Snippets",
      icon: "folderSolid",
      color: "text-violet-500",
      isExpanded: true,
      children: [
        { id: 15, name: "utilities.js", icon: "codeBrackets", color: "text-yellow-500" },
        { id: 16, name: "React-Hooks.md", icon: "document" }
      ]
    }
  ]);
  readonly commands: Command[] = [
    {
      id: 1,
      name: "New Note",
      description: "Create a new note at the top level",
      icon: "circlePlus",
      action: () => this.createNote()
    },
    {
      id: 2,
      name: "New Folder",
      description: "Create a new folder at the top level",
      icon: "folderSolid",
      action: () => this.createFolder()
    },
    {
      id: 3,
      name: "Toggle",
      description: "Collapse or expand the sidebar",
      icon: "menu",
      action: () => this.toggleSidebar()
    }
  ];

  private nextId = 17;
  private noteCount = 1;
  private folderCount = 1;

  createNote(): void {
    const id = this.consumeId();
    const noteNumber = this.noteCount++;

    this.nodes.update((nodes) => [
      ...nodes,
      {
        id,
        name: `Untitled-${noteNumber}.md`,
        description: "New note",
        icon: "document"
      }
    ]);
  }

  createFolder(): void {
    const id = this.consumeId();
    const folderNumber = this.folderCount++;

    this.nodes.update((nodes) => [
      ...nodes,
      {
        id,
        name: `New Folder ${folderNumber}`,
        description: "Empty folder",
        icon: "folderOutline",
        color: "text-sky-500",
        isExpanded: true,
        children: []
      }
    ]);
  }

  toggleSidebar(): void {
    this.isCollapsed.update((collapsed) => !collapsed);
  }

  private consumeId(): number {
    const id = this.nextId;
    this.nextId += 1;
    return id;
  }
}
