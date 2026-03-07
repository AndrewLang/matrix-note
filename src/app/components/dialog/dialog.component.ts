import { NgClass, NgComponentOutlet } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import { DialogButton, DialogService } from "../../services/dialog.service";
import { SvgComponent } from "../../shared/svg/svg.component";

@Component({
  selector: "mtx-dialog",
  imports: [NgClass, NgComponentOutlet, SvgComponent],
  templateUrl: "./dialog.component.html"
})
export class DialogComponent {
  readonly dialogService = inject(DialogService);
  readonly activeDialog = this.dialogService.activeDialog;

  close(): void {
    this.dialogService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.activeDialog();
    if (!dialog?.config.closeOnBackdrop || event.target !== event.currentTarget) {
      return;
    }

    this.close();
  }

  runButton(button: DialogButton): void {
    if (button.disabled) {
      return;
    }

    button.onClick?.();

    if (button.closesDialog ?? false) {
      this.close();
    }
  }

  buttonClass(button: DialogButton): string {
    switch (button.variant) {
      case "primary":
        return "bg-blue-500 text-white hover:bg-blue-600";
      case "danger":
        return "bg-rose-500 text-white hover:bg-rose-600";
      default:
        return "bg-black/5 text-gray-700 hover:bg-black/10 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/15";
    }
  }

  @HostListener("document:keydown.escape")
  onEscape(): void {
    const dialog = this.activeDialog();
    if (dialog?.config.closeOnEscape && dialog.config.closable) {
      this.close();
    }
  }
}
