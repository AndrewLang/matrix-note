import { NgClass } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import { Command } from "../../models/command";
import { ContextMenuService } from "../../services/context-menu.service";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-context-menu",
  imports: [NgClass, SvgComponent],
  templateUrl: "./context-menu.component.html"
})
export class ContextMenuComponent {
  readonly contextMenuService = inject(ContextMenuService);
  readonly activeMenu = this.contextMenuService.activeMenu;

  run(item: Command): void {
    this.contextMenuService.run(item);
  }

  @HostListener("document:click")
  @HostListener("document:scroll")
  @HostListener("window:resize")
  close(): void {
    this.contextMenuService.close();
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    this.contextMenuService.close();
  }
}
