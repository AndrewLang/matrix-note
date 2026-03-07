import { Injectable, Type, signal } from "@angular/core";

export interface DialogButton {
  id: string;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  closesDialog?: boolean;
  onClick?: () => void;
}

export interface DialogConfig<TInputs extends Record<string, unknown> = Record<string, unknown>> {
  title?: string;
  closable?: boolean;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  buttons?: DialogButton[];
  dialogClass?: string;
  bodyClass?: string;
  componentInputs?: TInputs;
}

export interface ActiveDialog {
  component: Type<unknown>;
  config: Required<Omit<DialogConfig, "componentInputs">> & {
    componentInputs: Record<string, unknown>;
  };
}

@Injectable({
  providedIn: "root"
})
export class DialogService {
  readonly activeDialog = signal<ActiveDialog | null>(null);

  open<TInputs extends Record<string, unknown>>(
    component: Type<unknown>,
    config: DialogConfig<TInputs> = {}
  ): void {
    this.activeDialog.set({
      component,
      config: {
        title: config.title ?? "",
        closable: config.closable ?? true,
        closeOnBackdrop: config.closeOnBackdrop ?? true,
        closeOnEscape: config.closeOnEscape ?? true,
        buttons: config.buttons ?? [],
        dialogClass: config.dialogClass ?? "",
        bodyClass: config.bodyClass ?? "",
        componentInputs: config.componentInputs ?? {}
      }
    });
  }

  close(): void {
    this.activeDialog.set(null);
  }
}
