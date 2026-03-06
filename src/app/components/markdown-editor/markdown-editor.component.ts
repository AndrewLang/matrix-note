import { Component, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-markdown-editor",
  standalone: true,
  imports: [FormsModule, SvgComponent],
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  templateUrl: "./markdown-editor.component.html"
})
export class MarkdownEditorComponent {
  @Input() content = "";
}
