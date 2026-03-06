import { Component, Input } from "@angular/core";
import { MarkdownEditorComponent } from "../../markdown-editor/markdown-editor.component";

@Component({
  selector: "mtx-workspace-tab",
  standalone: true,
  imports: [MarkdownEditorComponent],
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  template: `
    <mtx-markdown-editor [content]="content" />
  `
})
export class WorkspaceTabComponent {
  @Input() content = "";
}
