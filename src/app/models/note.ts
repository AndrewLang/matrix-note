export interface Note {
  id: number;
  title: string;
  content: string;
  categoryId?: number;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface NoteCategory {
  id: number;
  name: string;
  parentId?: number;
  description?: string;
  icon?: string;
  color?: string;
  isExpanded?: boolean;
}

export interface ExportedFiles {
  files: string[];
}
