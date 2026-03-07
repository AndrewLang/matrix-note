import { Component, inject } from "@angular/core";
import { DialogComponent } from "../dialog/dialog.component";
import { SettingsComponent } from "../settings/settings.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { WorkspaceComponent } from "../workspace/workspace.component";
import { DialogService } from "../../services/dialog.service";

@Component({
  selector: "mtx-home",
  standalone: true,
  imports: [DialogComponent, TitlebarComponent, SidebarComponent, WorkspaceComponent],
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  private readonly dialogService = inject(DialogService);

  openSettings(): void {
    this.dialogService.open(SettingsComponent, {
      title: "Settings",
      closable: true,
      closeOnBackdrop: true,
      closeOnEscape: true,
      dialogClass: "max-w-[700px] h-[500px]"
    });
  }
}
