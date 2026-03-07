import { NgClass } from "@angular/common";
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { EditableDocument } from "../../../models/document";
import { MarkdownEditorComponent } from "../../markdown-editor/markdown-editor.component";
import { MarkdownPreviewComponent } from "../../markdown-preview/markdown-preview.component";
import {
  SplitPrimaryDirective,
  SplitSecondaryDirective,
  SplitViewComponent
} from "../../split-view/split-view.component";
import { SvgComponent } from "../../../shared/svg/svg.component";

@Component({
  selector: "mtx-workspace-tab",
  standalone: true,
  imports: [
    NgClass,
    MarkdownEditorComponent,
    MarkdownPreviewComponent,
    SplitViewComponent,
    SplitPrimaryDirective,
    SplitSecondaryDirective,
    SvgComponent
  ],
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  templateUrl: "./workspace-tab.component.html"
})
export class WorkspaceTabComponent {
  @ViewChild(MarkdownEditorComponent) private editor?: MarkdownEditorComponent;
  @ViewChild(MarkdownPreviewComponent) private preview?: MarkdownPreviewComponent;
  @Input({ required: true }) document!: EditableDocument;
  @Output() documentChange = new EventEmitter<EditableDocument>();

  protected showPreview = true;
  protected previewPlacement: "right" | "top" = "right";
  protected splitRatio = 0.5;
  private syncingScroll = false;

  updateContent(content: string): void {
    this.documentChange.emit({
      ...this.document,
      content,
      isDirty: true
    });
  }

  protected togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  protected setPreviewPlacement(placement: "right" | "top"): void {
    this.previewPlacement = placement;
    this.splitRatio = 0.5;
  }

  protected updateSplitRatio(ratio: number): void {
    this.splitRatio = ratio;
  }

  protected syncFromEditor(progress: number): void {
    if (!this.showPreview) {
      return;
    }

    this.syncScroll("preview", progress);
  }

  protected syncFromPreview(progress: number): void {
    this.syncScroll("editor", progress);
  }

  protected splitDirection(): "horizontal" | "vertical" {
    return this.previewPlacement === "right" ? "horizontal" : "vertical";
  }

  private syncScroll(target: "editor" | "preview", progress: number): void {
    if (this.syncingScroll) {
      return;
    }

    this.syncingScroll = true;
    const updateTarget = () => {
      if (target === "editor") {
        this.editor?.setScrollProgress(progress);
      } else {
        this.preview?.setScrollProgress(progress);
      }

      requestAnimationFrame(() => {
        this.syncingScroll = false;
      });
    };

    requestAnimationFrame(updateTarget);
  }
}
