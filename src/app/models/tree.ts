export interface TreeNode {
  id: number;
  type: "note" | "category";
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isExpanded?: boolean;
  children?: TreeNode[];
  onExpand?: (node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
  onDrop?: (draggedNode: TreeNode, targetNode: TreeNode) => void | Promise<void>;
  onRename?: (node: TreeNode, name: string) => void | Promise<void>;
}
