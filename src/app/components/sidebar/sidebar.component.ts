import { Component } from "@angular/core";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "app-sidebar",
  standalone: true,
  imports: [SvgComponent],
  templateUrl: "./sidebar.component.html"
})
export class SidebarComponent {
  toggleFolderRecursive(event: MouseEvent): void {
    const trigger = event.currentTarget as HTMLElement | null;
    if (!trigger) {
      return;
    }

    const parent = trigger.parentElement;
    const contents = trigger.nextElementSibling as HTMLElement | null;

    if (!parent || !contents || !contents.classList.contains("folder-content")) {
      return;
    }

    const icon = trigger.querySelector("svg") as SVGElement | null;
    const isClosed = contents.style.display === "none" || !contents.style.display;
    if (isClosed) {
      contents.style.display = "block";
      contents.classList.remove("hidden");
      icon?.classList.add("rotate-90");
      return;
    }

    contents.style.display = "none";
    contents.classList.add("hidden");
    icon?.classList.remove("rotate-90");
  }
}
