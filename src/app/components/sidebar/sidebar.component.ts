import { Component, signal } from "@angular/core";
import { TreeNode } from "../../models/tree";
import { TreeComponent } from "../tree/tree.component";

@Component({
  selector: "mtx-sidebar",
  standalone: true,
  imports: [TreeComponent],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  readonly nodes = signal<TreeNode[]>([
    {
      id: 1,
      name: "Projects",
      icon: "folderSolid",
      color: "text-blue-500",
      children: [
        {
          id: 2,
          name: "Aero Redesign",
          icon: "folderOutline",
          color: "text-sky-500",
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
      children: [
        { id: 15, name: "utilities.js", icon: "codeBrackets", color: "text-yellow-500" },
        { id: 16, name: "React-Hooks.md", icon: "document" }
      ]
    }
  ]);
}
