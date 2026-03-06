import { Component, computed, effect, input, signal } from "@angular/core";
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

  private readonly expandedIds = signal(new Set<number>());
  private readonly indentation = 22;

  readonly childPadding = computed(() => `${this.depth() === 0 ? this.indentation : this.indentation + 6}px`);

  constructor() {
    effect(() => {
      const folderIds = this.collectFolderIds(this.nodes());
      this.expandedIds.update((expandedIds) => {
        if (expandedIds.size === 0) {
          return new Set(folderIds);
        }

        const next = new Set<number>();
        for (const id of folderIds) {
          if (expandedIds.has(id)) {
            next.add(id);
          }
        }
        return next;
      });
    });
  }

  trackNode(_: number, node: TreeNode): number {
    return node.id;
  }

  hasChildren(node: TreeNode): boolean {
    return !!node.children?.length;
  }

  isExpanded(node: TreeNode): boolean {
    return this.expandedIds().has(node.id);
  }

  toggle(node: TreeNode): void {
    if (!this.hasChildren(node)) {
      return;
    }

    this.expandedIds.update((expandedIds) => {
      const next = new Set(expandedIds);
      if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      return next;
    });
  }

  iconName(node: TreeNode): string {
    if (node.icon) {
      return node.icon;
    }

    return this.hasChildren(node) ? "folderOutline" : "document";
  }

  iconClass(node: TreeNode): string {
    const colorClass = node.color ?? (this.hasChildren(node) ? "text-sky-500" : "");
    return `mr-2.5 h-4 w-4 shrink-0 opacity-80 ${colorClass}`.trim();
  }

  rowClass(node: TreeNode): string {
    return this.hasChildren(node)
      ? "text-gray-700 dark:text-gray-300"
      : "text-gray-600 dark:text-gray-400";
  }

  private collectFolderIds(nodes: TreeNode[]): number[] {
    const ids: number[] = [];

    for (const node of nodes) {
      if (!this.hasChildren(node)) {
        continue;
      }

      ids.push(node.id, ...this.collectFolderIds(node.children ?? []));
    }

    return ids;
  }
}
