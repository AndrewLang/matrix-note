import { Component, HostListener, inject } from "@angular/core";
import { ContextMenuComponent } from "../context-menu/context-menu.component";
import { DialogService } from "../../services/dialog.service";
import { NoteService } from "../../services/note.service";
import { DialogComponent } from "../dialog/dialog.component";
import { SettingsComponent } from "../settings/settings.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { WorkspaceComponent } from "../workspace/workspace.component";

@Component({
  selector: "mtx-home",
  imports: [ContextMenuComponent, DialogComponent, TitlebarComponent, SidebarComponent, WorkspaceComponent],
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  private readonly dialogService = inject(DialogService);
  private readonly noteService = inject(NoteService);

  constructor() {
    void this.loadInitialData();
  }

  openSettings(): void {
    this.dialogService.open(SettingsComponent, {
      title: "Settings",
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      dialogClass: "max-w-[700px] h-[500px]"
    });
  }

  private async loadInitialData(): Promise<void> {
    try {
      await Promise.all([
        this.noteService.loadCategories(),
        this.noteService.loadNotes()
      ]);
    } catch (error) {
      console.error("Failed to load notes.", error);
    }
  }

  @HostListener("document:contextmenu", ["$event"])
  disableBrowserContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}
