import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-markdown-editor",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./markdown-editor.component.html"
})
export class MarkdownEditorComponent {
  @Input() content = "";
}
