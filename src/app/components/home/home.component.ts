import { Component, signal } from "@angular/core";
import { SettingsComponent } from "../settings/settings.component";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { WorkspaceComponent } from "../workspace/workspace.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [TitlebarComponent, SidebarComponent, WorkspaceComponent, SettingsComponent],
  templateUrl: "./home.component.html"
})
export class HomeComponent {
  readonly isSettingsOpen = signal(false);

  openSettings(): void {
    this.isSettingsOpen.set(true);
  }

  closeSettings(): void {
    this.isSettingsOpen.set(false);
  }
}
