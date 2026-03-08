import { Injectable, computed, signal } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
import { ExportedFiles, Note, NoteCategory } from "../models/note";
import { TreeNode } from "../models/tree";

@Injectable({
  providedIn: "root"
})
export class NoteService {
  readonly categories = signal<NoteCategory[]>([]);

  readonly notes = signal<Note[]>([]);

  readonly treeNodes = computed(() => this.buildTree());

  private nextId = 17;
  private noteCount = 1;
  private categoryCount = 1;

  createNote(categoryId?: number): Note {
    const now = Date.now();
    const id = this.consumeId();
    const noteNumber = this.noteCount++;
    const note: Note = {
      id,
      title: `Untitled-${noteNumber}.md`,
      content: "# New Note\n\nStart writing...",
      categoryId,
      description: "New note",
      icon: "document",
      createdAt: now,
      updatedAt: now
    };

    this.notes.update((notes) => [...notes, note]);
    return note;
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

  getNoteById(noteId: number): Note | undefined {
    return this.notes().find((note) => note.id === noteId);
  }

  updateNoteContent(noteId: number, content: string): void {
    this.notes.update((notes) =>
      notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              content,
              updatedAt: Date.now()
            }
          : note
      )
    );
  }

  async loadCategories(): Promise<NoteCategory[]> {
    const categories = await invoke<NoteCategory[]>("get_categories");
    this.categories.set(categories);
    return categories;
  }

  getCategory(categoryId: number): Promise<NoteCategory | null> {
    return invoke<NoteCategory | null>("get_category", { categoryId });
  }

  async saveCategory(category: NoteCategory): Promise<NoteCategory> {
    const savedCategory = await invoke<NoteCategory>("save_category", { category });
    this.categories.update((categories) => upsertById(categories, savedCategory));
    return savedCategory;
  }

  async updateCategory(category: NoteCategory): Promise<NoteCategory> {
    const savedCategory = await invoke<NoteCategory>("update_category", { category });
    this.categories.update((categories) => upsertById(categories, savedCategory));
    return savedCategory;
  }

  async deleteCategory(categoryId: number): Promise<void> {
    await invoke<void>("delete_category", { categoryId });
    this.categories.update((categories) =>
      categories.filter((category) => category.id !== categoryId)
    );
  }

  async loadNotes(categoryId?: number): Promise<Note[]> {
    const notes = await invoke<Note[]>("get_notes", { categoryId });
    if (categoryId === undefined) {
      this.notes.set(notes);
      return notes;
    }

    this.notes.update((existingNotes) => {
      const unrelatedNotes = existingNotes.filter((note) => note.categoryId !== categoryId);
      return [...unrelatedNotes, ...notes];
    });
    return notes;
  }

  getNote(noteId: number): Promise<Note | null> {
    return invoke<Note | null>("get_note", { noteId });
  }

  async saveNote(note: Note): Promise<Note> {
    const savedNote = await invoke<Note>("save_note", { note });
    this.notes.update((notes) => upsertById(notes, savedNote));
    return savedNote;
  }

  async updateNote(note: Note): Promise<Note> {
    const savedNote = await invoke<Note>("update_note", { note });
    this.notes.update((notes) => upsertById(notes, savedNote));
    return savedNote;
  }

  async deleteNote(noteId: number): Promise<void> {
    await invoke<void>("delete_note", { noteId });
    this.notes.update((notes) => notes.filter((note) => note.id !== noteId));
  }

  exportNote(noteId: number, destinationPath: string): Promise<string> {
    return invoke<string>("export_note", { noteId, destinationPath });
  }

  exportCategoryNotes(
    categoryId: number,
    destinationDir: string,
    recursive = true
  ): Promise<ExportedFiles> {
    return invoke<ExportedFiles>("export_category_notes", {
      categoryId,
      destinationDir,
      recursive
    });
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

  private consumeId(): number {
    const id = this.nextId;
    this.nextId += 1;
    return id;
  }
}

function upsertById<T extends { id: number }>(items: T[], item: T): T[] {
  const index = items.findIndex((current) => current.id === item.id);
  if (index === -1) {
    return [...items, item];
  }

  const nextItems = [...items];
  nextItems[index] = item;
  return nextItems;
}
