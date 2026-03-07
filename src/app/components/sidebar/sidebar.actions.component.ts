import { Component, computed, input } from "@angular/core";
import { Command } from "../../models/command";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-sidebar-actions",
  imports: [SvgComponent],
  templateUrl: "./sidebar.actions.component.html"
})
export class SidebarActionsComponent {
  readonly commands = input.required<Command[]>();
  readonly collapsed = input(false);
  readonly visibleCommands = computed(() =>
    this.collapsed() ? this.commands().filter((command) => command.name === "Toggle") : this.commands()
  );

  iconName(command: Command): string {
    if (command.name === "Toggle") {
      return this.collapsed() ? "layout-sidebar-inset" : "layout-sidebar-inset-reverse";
    }

    return command.icon || "circlePlus";
  }
}
