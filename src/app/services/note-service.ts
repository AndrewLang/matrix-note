import { Injectable, computed, signal } from "@angular/core";
import { Note, NoteCategory } from "../models/note";
import { TreeNode } from "../models/tree";

@Injectable({
  providedIn: "root"
})
export class NoteService {
  readonly categories = signal<NoteCategory[]>([
    {
      id: 1,
      name: "Projects",
      icon: "folderSolid",
      color: "text-blue-500",
      isExpanded: true
    },
    {
      id: 2,
      name: "Aero Redesign",
      parentId: 1,
      icon: "folderOutline",
      color: "text-sky-500",
      isExpanded: true
    },
    {
      id: 6,
      name: "API Gateway V2",
      parentId: 1,
      icon: "folderOutline",
      color: "text-sky-500",
      isExpanded: true
    },
    {
      id: 10,
      name: "Personal Notes",
      icon: "folderSolid",
      color: "text-emerald-500",
      isExpanded: true
    },
    {
      id: 13,
      name: "Archive",
      parentId: 10,
      icon: "folderSolid",
      color: "text-rose-500",
      isExpanded: true
    },
    {
      id: 14,
      name: "Code Snippets",
      icon: "folderSolid",
      color: "text-violet-500",
      isExpanded: true
    }
  ]);

  readonly notes = signal<Note[]>([
    this.createSeedNote(3, "Architecture.md", 2),
    this.createSeedNote(4, "Design-System.md", 2),
    this.createSeedNote(5, "Assets/", 2, "cloud"),
    this.createSeedNote(7, "routes.rs", 6, "circlePlus", "text-[#e34c26]"),
    this.createSeedNote(8, "middleware.rs", 6, "circlePlus", "text-[#e34c26]"),
    this.createSeedNote(9, "README.md", 6),
    this.createSeedNote(11, "12-Oct-Sync.md", 10),
    this.createSeedNote(12, "Todo-List.md", 10),
    this.createSeedNote(15, "utilities.js", 14, "codeBrackets", "text-yellow-500"),
    this.createSeedNote(16, "React-Hooks.md", 14)
  ]);

  readonly treeNodes = computed(() => this.buildTree());

  private nextId = 17;
  private noteCount = 1;
  private categoryCount = 1;

  createNote(categoryId?: number): void {
    const now = Date.now();
    const id = this.consumeId();
    const noteNumber = this.noteCount++;

    this.notes.update((notes) => [
      ...notes,
      {
        id,
        title: `Untitled-${noteNumber}.md`,
        content: "",
        categoryId,
        description: "New note",
        icon: "document",
        createdAt: now,
        updatedAt: now
      }
    ]);
  }

  createCategory(parentId?: number): void {
    const id = this.consumeId();
    const categoryNumber = this.categoryCount++;

    this.categories.update((categories) => [
      ...categories,
      {
        id,
        name: `New Folder ${categoryNumber}`,
        parentId,
        description: "Empty folder",
        icon: "folderOutline",
        color: "text-sky-500",
        isExpanded: true
      }
    ]);
  }

  setCategoryExpanded(categoryId: number, isExpanded: boolean): void {
    this.categories.update((categories) =>
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isExpanded }
          : category
      )
    );
  }

  private buildTree(parentId?: number): TreeNode[] {
    const categoryNodes = this.categories()
      .filter((category) => category.parentId === parentId)
      .map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color,
        isExpanded: category.isExpanded ?? true,
        onExpand: (node: TreeNode) => this.setCategoryExpanded(category.id, node.isExpanded ?? true),
        children: this.buildTree(category.id)
      }));

    const directNotes = this.notes()
      .filter((note) => note.categoryId === parentId)
      .map((note) => this.toNoteNode(note));

    return [...categoryNodes, ...directNotes];
  }

  private toNoteNode(note: Note): TreeNode {
    return {
      id: note.id,
      name: note.title,
      description: note.description,
      icon: note.icon,
      color: note.color
    };
  }

  private createSeedNote(
    id: number,
    title: string,
    categoryId?: number,
    icon = "document",
    color?: string
  ): Note {
    const now = Date.now();

    return {
      id,
      title,
      content: "",
      categoryId,
      icon,
      color,
      createdAt: now,
      updatedAt: now
    };
  }

  private consumeId(): number {
    const id = this.nextId;
    this.nextId += 1;
    return id;
  }
}
