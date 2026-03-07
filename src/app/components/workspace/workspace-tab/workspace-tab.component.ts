import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MarkdownEditorComponent } from "../../markdown-editor/markdown-editor.component";
import { EditableDocument } from "../../../models/document";

@Component({
  selector: "mtx-workspace-tab",
  standalone: true,
  imports: [MarkdownEditorComponent],
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  template: `
    <mtx-markdown-editor [content]="document.content" (contentChange)="updateContent($event)" />
  `
})
export class WorkspaceTabComponent {
  @Input({ required: true }) document!: EditableDocument;
  @Output() documentChange = new EventEmitter<EditableDocument>();

  updateContent(content: string): void {
    this.documentChange.emit({
      ...this.document,
      content,
      isDirty: true
    });
  }
}
