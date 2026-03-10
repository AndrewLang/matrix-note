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

  async createNote(categoryId?: number): Promise<Note> {
    const now = Date.now();
    const id = this.consumeId();
    const noteNumber = this.noteCount++;
    const note: Note = {
      id,
      title: `Note-${noteNumber}`,
      content: "# New Note\n\nStart writing...",
      categoryId,
      description: "New note",
      icon: "document",
      createdAt: now,
      updatedAt: now
    };

    return this.saveNote(note);
  }

  async createCategory(parentId?: number): Promise<NoteCategory> {
    const id = this.consumeId();
    const categoryNumber = this.categoryCount++;
    const category: NoteCategory = {
      id,
      name: `New Folder ${categoryNumber}`,
      parentId,
      description: "Empty folder",
      icon: "folderOutline",
      color: "text-sky-500",
      isExpanded: true
    };

    return this.saveCategory(category);
  }

  setCategoryExpanded(categoryId: number, isExpanded: boolean): void {
    const category = this.getCategoryById(categoryId);
    if (!category || category.isExpanded === isExpanded) {
      return;
    }

    this.categories.update((categories) =>
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isExpanded }
          : category
      )
    );

    void this.updateCategory({
      ...category,
      isExpanded
    }).catch((error) => {
      console.error(`Failed to persist category ${categoryId} expanded state.`, error);
      this.categories.update((categories) =>
        categories.map((currentCategory) =>
          currentCategory.id === categoryId
            ? { ...currentCategory, isExpanded: category.isExpanded }
            : currentCategory
        )
      );
    });
  }

  getNoteById(noteId: number): Note | undefined {
    return this.notes().find((note) => note.id === noteId);
  }

  getCategoryById(categoryId: number): NoteCategory | undefined {
    return this.categories().find((category) => category.id === categoryId);
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
    const categories = (await invoke<NoteCategory[]>("get_categories"))
      .map((category) => this.normalizeCategory(category));
    this.categories.set(categories);
    this.syncIdentityState();
    return categories;
  }

  getCategory(categoryId: number): Promise<NoteCategory | null> {
    return invoke<NoteCategory | null>("get_category", { categoryId })
      .then((category) => category ? this.normalizeCategory(category) : null);
  }

  async saveCategory(category: NoteCategory): Promise<NoteCategory> {
    const savedCategory = this.normalizeCategory(
      await invoke<NoteCategory>("save_category", { category })
    );
    this.categories.update((categories) => upsertById(categories, savedCategory));
    return savedCategory;
  }

  async updateCategory(category: NoteCategory): Promise<NoteCategory> {
    const savedCategory = this.normalizeCategory(
      await invoke<NoteCategory>("update_category", { category })
    );
    this.categories.update((categories) => upsertById(categories, savedCategory));
    return savedCategory;
  }

  async moveCategory(categoryId: number, parentId?: number): Promise<NoteCategory> {
    const category = this.getCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category ${categoryId} was not found.`);
    }

    if (parentId === categoryId) {
      throw new Error("A category cannot be moved into itself.");
    }

    if (parentId !== undefined && this.isCategoryDescendant(parentId, categoryId)) {
      throw new Error("A category cannot be moved into one of its descendants.");
    }

    return this.updateCategory({
      ...category,
      parentId
    });
  }

  async renameCategory(categoryId: number, name: string): Promise<NoteCategory> {
    const category = this.getCategoryById(categoryId);
    if (!category) {
      throw new Error(`Category ${categoryId} was not found.`);
    }

    return this.updateCategory({
      ...category,
      name
    });
  }

  async deleteCategory(categoryId: number): Promise<void> {
    await invoke<void>("delete_category", { categoryId });
    this.categories.update((categories) =>
      categories.filter((category) => category.id !== categoryId)
    );
  }

  async loadNotes(categoryId?: number): Promise<Note[]> {
    const notes = (await invoke<Note[]>("get_notes", { categoryId }))
      .map((note) => this.normalizeNote(note));
    if (categoryId === undefined) {
      this.notes.set(notes);
      this.syncIdentityState();
      return notes;
    }

    this.notes.update((existingNotes) => {
      const unrelatedNotes = existingNotes.filter((note) => note.categoryId !== categoryId);
      return [...unrelatedNotes, ...notes];
    });
    return notes;
  }

  getNote(noteId: number): Promise<Note | null> {
    return invoke<Note | null>("get_note", { noteId })
      .then((note) => note ? this.normalizeNote(note) : null);
  }

  searchNotes(keyword: string): Promise<Note[]> {
    return invoke<Note[]>("search_notes", { keyword })
      .then((notes) => notes.map((note) => this.normalizeNote(note)));
  }

  async saveNote(note: Note): Promise<Note> {
    const savedNote = this.normalizeNote(
      await invoke<Note>("save_note", { note })
    );
    this.notes.update((notes) => upsertById(notes, savedNote));
    return savedNote;
  }

  async updateNote(note: Note): Promise<Note> {
    const savedNote = this.normalizeNote(
      await invoke<Note>("update_note", { note })
    );
    this.notes.update((notes) => upsertById(notes, savedNote));
    return savedNote;
  }

  async moveNote(noteId: number, categoryId?: number): Promise<Note> {
    const note = this.getNoteById(noteId);
    if (!note) {
      throw new Error(`Note ${noteId} was not found.`);
    }

    return this.updateNote({
      ...note,
      categoryId,
      updatedAt: Date.now()
    });
  }

  async renameNote(noteId: number, title: string): Promise<Note> {
    const note = this.getNoteById(noteId);
    if (!note) {
      throw new Error(`Note ${noteId} was not found.`);
    }

    return this.updateNote({
      ...note,
      title,
      updatedAt: Date.now()
    });
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
        type: "category" as const,
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
      type: "note",
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

  private syncIdentityState(): void {
    const maxCategoryId = this.categories().reduce((max, category) => Math.max(max, category.id), 0);
    const maxNoteId = this.notes().reduce((max, note) => Math.max(max, note.id), 0);
    this.nextId = Math.max(this.nextId, maxCategoryId, maxNoteId) + 1;
    this.noteCount = Math.max(this.noteCount, this.notes().length + 1);
    this.categoryCount = Math.max(this.categoryCount, this.categories().length + 1);
  }

  private normalizeNote(note: Note): Note {
    return {
      ...note,
      categoryId: note.categoryId ?? undefined
    };
  }

  private normalizeCategory(category: NoteCategory): NoteCategory {
    return {
      ...category,
      parentId: category.parentId ?? undefined
    };
  }

  private isCategoryDescendant(categoryId: number, ancestorId: number): boolean {
    let currentParentId = this.getCategoryById(categoryId)?.parentId;

    while (currentParentId !== undefined) {
      if (currentParentId === ancestorId) {
        return true;
      }

      currentParentId = this.getCategoryById(currentParentId)?.parentId;
    }

    return false;
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
