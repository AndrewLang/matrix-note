export interface TreeNode {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isExpanded?: boolean;
  children?: TreeNode[];
  onExpand?: (node: TreeNode) => void;
  onSelect?: (node: TreeNode) => void;
}
