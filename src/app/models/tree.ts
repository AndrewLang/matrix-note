export interface TreeNode {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    children?: TreeNode[];
}