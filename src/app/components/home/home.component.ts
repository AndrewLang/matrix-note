import { Component } from "@angular/core";
import { SidebarComponent } from "../sidebar/sidebar.component";
import { TitlebarComponent } from "../titlebar/titlebar.component";
import { WorkspaceComponent } from "../workspace/workspace.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [TitlebarComponent, SidebarComponent, WorkspaceComponent],
  templateUrl: "./home.component.html"
})
export class HomeComponent {}
