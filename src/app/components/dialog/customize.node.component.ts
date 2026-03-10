import { NgClass } from "@angular/common";
import { Component, effect, inject, input, signal } from "@angular/core";
import { DialogService } from "../../services/dialog.service";
import { NoteService } from "../../services/note.service";
import { SvgComponent } from "../../shared/svg/svg.component";

type EditableEntityType = "note" | "category";

type ColorOption = {
  label: string;
  value?: string;
  swatchClass: string;
};

@Component({
  selector: "mtx-customize-node",
  imports: [NgClass, SvgComponent],
  templateUrl: "./customize.node.component.html"
})
export class CustomizeNodeComponent {
  readonly entityType = input.required<EditableEntityType>();
  readonly entityId = input.required<number>();
  readonly entityName = input.required<string>();
  readonly initialIcon = input<string | undefined>(undefined);
  readonly initialColor = input<string | undefined>(undefined);

  readonly iconOptions = [
    "document",
    "folderOutline",
    "folderSolid",
    "appLogo",
    "bookmark",
    "tag",
    "codeBrackets",
    "code",
    "cloud",
    "sparkles"
  ] as const;

  readonly colorOptions: ColorOption[] = [
    { label: "Default", value: undefined, swatchClass: "bg-slate-400" },
    { label: "Sky", value: "text-sky-500", swatchClass: "bg-sky-500" },
    { label: "Emerald", value: "text-emerald-500", swatchClass: "bg-emerald-500" },
    { label: "Amber", value: "text-amber-500", swatchClass: "bg-amber-500" },
    { label: "Rose", value: "text-rose-500", swatchClass: "bg-rose-500" },
    { label: "Violet", value: "text-violet-500", swatchClass: "bg-violet-500" },
    { label: "Slate", value: "text-slate-500", swatchClass: "bg-slate-500" }
  ];

  private readonly dialogService = inject(DialogService);
  private readonly noteService = inject(NoteService);

  readonly selectedIcon = signal<string | undefined>(undefined);
  readonly selectedColor = signal<string | undefined>(undefined);
  readonly isSaving = signal(false);

  constructor() {
    effect(() => {
      this.selectedIcon.set(this.initialIcon());
      this.selectedColor.set(this.initialColor());
    }, { allowSignalWrites: true });
  }

  previewIcon(): string {
    if (this.selectedIcon()) {
      return this.selectedIcon()!;
    }

    return this.entityType() === "category" ? "folderOutline" : "document";
  }

  previewColorClass(): string {
    return this.selectedColor() ?? (this.entityType() === "category" ? "text-sky-500" : "");
  }

  selectIcon(icon: string): void {
    this.selectedIcon.set(icon);
  }

  resetIcon(): void {
    this.selectedIcon.set(undefined);
  }

  selectColor(color?: string): void {
    this.selectedColor.set(color);
  }

  resetColor(): void {
    this.selectedColor.set(undefined);
  }

  close(): void {
    this.dialogService.close();
  }

  async save(): Promise<void> {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);

    try {
      if (this.entityType() === "category") {
        const category = this.noteService.getCategoryById(this.entityId());
        if (!category) {
          throw new Error(`Category ${this.entityId()} was not found.`);
        }

        await this.noteService.updateCategory({
          ...category,
          icon: this.normalizeValue(this.selectedIcon()),
          color: this.normalizeValue(this.selectedColor())
        });
      } else {
        const note = this.noteService.getNoteById(this.entityId());
        if (!note) {
          throw new Error(`Note ${this.entityId()} was not found.`);
        }

        await this.noteService.updateNote({
          ...note,
          icon: this.normalizeValue(this.selectedIcon()),
          color: this.normalizeValue(this.selectedColor()),
          updatedAt: Date.now()
        });
      }

      this.dialogService.close();
    } finally {
      this.isSaving.set(false);
    }
  }

  private normalizeValue(value?: string): string | undefined {
    return value?.trim() ? value : undefined;
  }
}
