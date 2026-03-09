import { Directive, HostListener, Input, inject } from "@angular/core";
import { ContextMenuPayload, ContextMenuTargetType } from "../models/context-menu";
import { ContextMenuService } from "../services/context-menu.service";

@Directive({
  selector: "[mtxContextMenu]"
})
export class ContextMenuDirective {
  private readonly contextMenuService = inject(ContextMenuService);

  @Input("mtxContextMenu") type!: ContextMenuTargetType;
  @Input() contextMenuPayload!: ContextMenuPayload;

  @HostListener("contextmenu", ["$event"])
  onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.type || !this.contextMenuPayload) {
      this.contextMenuService.close();
      return;
    }

    this.contextMenuService.open(
      this.type,
      this.contextMenuPayload,
      event.clientX,
      event.clientY
    );
  }
}
