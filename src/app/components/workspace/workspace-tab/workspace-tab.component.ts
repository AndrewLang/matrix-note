import { Component, Input } from "@angular/core";
import { MarkdownEditorComponent } from "../../markdown-editor/markdown-editor.component";

@Component({
  selector: "app-workspace-tab",
  standalone: true,
  imports: [MarkdownEditorComponent],
  template: `
    <app-markdown-editor [content]="content" />
  `
})
export class WorkspaceTabComponent {
  @Input() content = "";
}
