import { ChangeDetectionStrategy, Component, Input, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { SvgDefinition, Svgs } from "./svgs";

@Component({
  selector: "mtx-svg",
  standalone: true,
  template: `
    <svg
      [attr.viewBox]="icon?.viewBox"
      [attr.fill]="icon?.fill ?? null"
      [attr.stroke]="icon?.stroke ?? null"
      [attr.stroke-width]="icon?.strokeWidth ?? null"
      [attr.aria-hidden]="title ? null : true"
      [attr.role]="title ? 'img' : null"
      [attr.focusable]="false"
      [class]="svgClass"
      [innerHTML]="body"
    ></svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SvgComponent {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) name = "";
  @Input() svgClass = "";
  @Input() title = "";

  get icon(): SvgDefinition | null {
    return Svgs.get(this.name);
  }

  get body(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.icon?.body ?? "");
  }
}
