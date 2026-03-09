import { Component, computed, input } from "@angular/core";
import { TreeNode } from "../../models/tree";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-tree",
  imports: [SvgComponent, TreeComponent],
  templateUrl: "./tree.component.html"
})
export class TreeComponent {
  readonly nodes = input.required<TreeNode[]>();
  readonly depth = input(0);

  private readonly indentation = 20;
  protected hoveredDropNodeId: number | null = null;
  protected editingNodeId: number | null = null;
  protected editingName = "";

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

  select(node: TreeNode): void {
    if (this.hasChildren(node)) {
      return;
    }

    node.onSelect?.(node);
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

  isDraggable(node: TreeNode): boolean {
    return node.type === "note" || node.type === "category";
  }

  isDropTarget(node: TreeNode): boolean {
    return this.hoveredDropNodeId === node.id;
  }

  canDropOn(node: TreeNode): boolean {
    return node.type === "category";
  }

  isEditing(node: TreeNode): boolean {
    return this.editingNodeId === node.id;
  }

  startRename(node: TreeNode, event?: MouseEvent): void {
    event?.preventDefault();
    event?.stopPropagation();
    this.editingNodeId = node.id;
    this.editingName = node.name;
  }

  updateEditingName(event: Event): void {
    this.editingName = (event.target as HTMLInputElement).value;
  }

  async commitRename(node: TreeNode): Promise<void> {
    const nextName = this.editingName.trim();
    this.editingNodeId = null;

    if (!nextName || nextName === node.name) {
      this.editingName = "";
      return;
    }

    this.editingName = "";
    await node.onRename?.(node, nextName);
  }

  cancelRename(): void {
    this.editingNodeId = null;
    this.editingName = "";
  }

  async handleRenameKeydown(event: KeyboardEvent, node: TreeNode): Promise<void> {
    if (event.key === "Enter") {
      event.preventDefault();
      await this.commitRename(node);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.cancelRename();
    }
  }

  startDrag(event: DragEvent, node: TreeNode): void {
    if (!this.isDraggable(node)) {
      return;
    }

    event.stopPropagation();
    const payload = JSON.stringify({
      id: node.id,
      type: node.type
    });
    event.dataTransfer?.setData("application/x-matrix-note-node", payload);
    event.dataTransfer?.setData("text/plain", payload);

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  endDrag(): void {
    this.hoveredDropNodeId = null;
  }

  dragOver(event: DragEvent, node: TreeNode): void {
    if (!this.canDropOn(node)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.hoveredDropNodeId = node.id;

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  dragLeave(event: DragEvent, node: TreeNode): void {
    event.stopPropagation();

    if (this.hoveredDropNodeId === node.id) {
      this.hoveredDropNodeId = null;
    }
  }

  drop(event: DragEvent, targetNode: TreeNode): void {
    const draggedNode = this.readDraggedNode(event);
    this.hoveredDropNodeId = null;

    if (!draggedNode || !this.canDropOn(targetNode)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    targetNode.onDrop?.(draggedNode, targetNode);
  }

  private readDraggedNode(event: DragEvent): TreeNode | null {
    const payload = event.dataTransfer?.getData("application/x-matrix-note-node")
      || event.dataTransfer?.getData("text/plain");
    if (!payload) {
      return null;
    }

    try {
      const draggedNode = JSON.parse(payload) as Pick<TreeNode, "id" | "type">;
      return {
        id: draggedNode.id,
        type: draggedNode.type,
        name: ""
      };
    } catch {
      return null;
    }
  }
}
