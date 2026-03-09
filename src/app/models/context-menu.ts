import { Command } from "./command";
import { EditableDocument } from "./document";
import { TreeNode } from "./tree";

export const ContextMenuTargetTypes = {
  Category: "category",
  NoteNode: "note-node",
  Tab: "tab"
} as const;

export type ContextMenuTargetType =
  typeof ContextMenuTargetTypes[keyof typeof ContextMenuTargetTypes];

export interface ContextMenuState {
  x: number;
  y: number;
  items: Command[];
}

export type ContextMenuPayload = TreeNode | EditableDocument;
