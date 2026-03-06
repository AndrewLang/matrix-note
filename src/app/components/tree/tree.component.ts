import { Component, computed, input } from "@angular/core";
import { TreeNode } from "../../models/tree";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-tree",
  standalone: true,
  imports: [SvgComponent, TreeComponent],
  templateUrl: "./tree.component.html"
})
export class TreeComponent {
  readonly nodes = input.required<TreeNode[]>();
  readonly depth = input(0);

  private readonly indentation = 20;

  readonly childPadding = computed(() => `${this.depth() === 0 ? this.indentation : this.indentation + 4}px`);

  trackNode(_: number, node: TreeNode): number {
    return node.id;
  }

  hasChildren(node: TreeNode): boolean {
    return Array.isArray(node.children);
  }

  isExpanded(node: TreeNode): boolean {
    return node.isExpanded ?? true;
  }

  toggle(node: TreeNode): void {
    if (!this.hasChildren(node)) {
      return;
    }

    node.isExpanded = !this.isExpanded(node);
    node.onExpand?.(node);
  }

  iconName(node: TreeNode): string {
    if (node.icon) {
      return node.icon;
    }

    return this.hasChildren(node) ? "folderOutline" : "document";
  }

  iconClass(node: TreeNode): string {
    const colorClass = node.color ?? (this.hasChildren(node) ? "text-sky-500" : "");
    return `mr-1 h-4 w-4 shrink-0 opacity-80 ${colorClass}`.trim();
  }

  rowClass(node: TreeNode): string {
    return this.hasChildren(node)
      ? "text-gray-700 dark:text-gray-300"
      : "text-gray-600 dark:text-gray-400";
  }
}
