import { Component, EventEmitter, Input, Output, ViewChild, inject } from "@angular/core";
import { ViewOrientations } from "@app/models/uistates";
import { EditableDocument } from "../../../models/document";
import { UiStateService } from "../../../services/uistate.service";
import { MarkdownEditorComponent } from "../../markdown-editor/markdown-editor.component";
import { MarkdownPreviewComponent } from "../../markdown-preview/markdown-preview.component";
import {
  SplitPrimaryDirective,
  SplitSecondaryDirective,
  SplitViewComponent
} from "../../split-view/split-view.component";

@Component({
  selector: "mtx-workspace-tab",
  imports: [
    MarkdownEditorComponent,
    MarkdownPreviewComponent,
    SplitViewComponent,
    SplitPrimaryDirective,
    SplitSecondaryDirective
  ],
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  templateUrl: "./workspace-tab.component.html"
})
export class WorkspaceTabComponent {
  private readonly uiStateService = inject(UiStateService);
  @ViewChild(MarkdownEditorComponent) private editor?: MarkdownEditorComponent;
  @ViewChild(MarkdownPreviewComponent) private preview?: MarkdownPreviewComponent;
  @Input({ required: true }) document!: EditableDocument;
  @Output() documentChange = new EventEmitter<EditableDocument>();

  protected readonly showPreview = this.uiStateService.isPreviewVisible;
  protected readonly showEditor = this.uiStateService.isEditorVisible;
  protected readonly previewPlacement = this.uiStateService.previewPlacement;
  protected splitRatio = 0.5;
  private syncingScroll = false;

  updateContent(content: string): void {
    this.documentChange.emit({
      ...this.document,
      content,
      isDirty: true
    });
  }

  protected updateSplitRatio(ratio: number): void {
    this.splitRatio = ratio;
  }

  protected syncFromEditor(progress: number): void {
    if (!this.showPreview()) {
      return;
    }

    this.syncScroll("preview", progress);
  }

  protected syncFromPreview(progress: number): void {
    this.syncScroll("editor", progress);
  }

  protected splitDirection(): "horizontal" | "vertical" {
    return this.previewPlacement() === ViewOrientations.Horizontal ? "horizontal" : "vertical";
  }

  protected showSplitView(): boolean {
    return this.showPreview() && this.showEditor();
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
