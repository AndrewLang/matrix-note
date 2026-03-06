import { Component } from "@angular/core";

@Component({
  selector: "app-sidebar",
  standalone: true,
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

    const isClosed = contents.style.display === "none" || !contents.style.display;
    if (isClosed) {
      contents.style.display = "block";
      parent.classList.add("folder-open");
      contents.classList.remove("hidden");
      return;
    }

    contents.style.display = "none";
    parent.classList.remove("folder-open");
    contents.classList.add("hidden");
  }
}
