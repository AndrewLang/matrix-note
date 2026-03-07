import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { DialogMessageComponent } from "../dialog/dialog-message.component";
import { EditableDocument } from "../../models/document";
import { DialogService } from "../../services/dialog.service";
import { WorkspaceService } from "../../services/workspace.service";
import { SvgComponent } from "../../shared/svg/svg.component";
import { WorkspaceTabComponent } from "./workspace-tab/workspace-tab.component";

@Component({
  selector: "mtx-workspace",
  standalone: true,
  imports: [NgClass, SvgComponent, WorkspaceTabComponent],
  host: {
    class: "flex-1 min-w-0 min-h-0 w-full h-full flex"
  },
  templateUrl: "./workspace.component.html"
})
export class WorkspaceComponent {
  private readonly dialogService = inject(DialogService);
  private readonly workspaceService = inject(WorkspaceService);

  readonly tabs = this.workspaceService.tabs;
  readonly activeTabId = this.workspaceService.activeTabId;

  selectTab(id: number): void {
    this.workspaceService.selectTab(id);
  }

  addTab(): void {
    this.workspaceService.createNoteTab();
  }

  closeTab(id: number, event: MouseEvent): void {
    event.stopPropagation();
    const current = this.tabs();
    const tab = current.find((currentTab) => currentTab.id === id);
    if (!tab) {
      return;
    }

    if (tab.isDirty) {
      this.dialogService.open(DialogMessageComponent, {
        title: "Discard changes?",
        closable: true,
        closeOnBackdrop: true,
        closeOnEscape: true,
        dialogClass: "max-w-[440px]",
        componentInputs: {
          message: `Close "${tab.title}" without saving?`,
          description: "This document has unsaved changes. Closing the tab will discard them."
        },
        buttons: [
          {
            id: "cancel-close",
            label: "Cancel",
            closesDialog: true
          },
          {
            id: "discard-close",
            label: "Discard",
            variant: "danger",
            closesDialog: true,
            onClick: () => this.workspaceService.closeTab(id)
          }
        ]
      });
      return;
    }

    this.workspaceService.closeTab(id);
  }

  updateDocument(document: EditableDocument): void {
    this.workspaceService.updateDocument(document);
  }
}
