import { NgClass, NgStyle, NgTemplateOutlet } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from "@angular/core";

@Directive({
  selector: "ng-template[splitPrimary]",
  standalone: true
})
export class SplitPrimaryDirective {
  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

@Directive({
  selector: "ng-template[splitSecondary]",
  standalone: true
})
export class SplitSecondaryDirective {
  constructor(readonly templateRef: TemplateRef<unknown>) {}
}

@Component({
  selector: "mtx-split-view",
  standalone: true,
  imports: [NgClass, NgStyle, NgTemplateOutlet],
  host: {
    class: "flex h-full min-h-0 w-full min-w-0"
  },
  templateUrl: "./split-view.component.html"
})
export class SplitViewComponent implements AfterViewInit, OnChanges {
  @ViewChild("container") private container?: ElementRef<HTMLDivElement>;
  @ContentChild(SplitPrimaryDirective) protected primaryPane?: SplitPrimaryDirective;
  @ContentChild(SplitSecondaryDirective) protected secondaryPane?: SplitSecondaryDirective;

  @Input() direction: "horizontal" | "vertical" = "horizontal";
  @Input() primarySize = 0.5;
  @Input() minPrimarySize = 0.2;
  @Input() minSecondarySize = 0.2;
  @Output() primarySizeChange = new EventEmitter<number>();

  protected currentPrimarySize = 0.5;
  protected isDragging = false;

  ngAfterViewInit(): void {
    this.currentPrimarySize = this.clampSize(this.primarySize);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["primarySize"]) {
      this.currentPrimarySize = this.clampSize(this.primarySize);
    }
  }

  protected startDrag(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  @HostListener("window:mouseup")
  protected stopDrag(): void {
    this.isDragging = false;
  }

  @HostListener("window:mousemove", ["$event"])
  protected onPointerMove(event: MouseEvent): void {
    if (!this.isDragging || !this.container) {
      return;
    }

    const rect = this.container.nativeElement.getBoundingClientRect();
    const size =
      this.direction === "horizontal"
        ? (event.clientX - rect.left) / rect.width
        : (event.clientY - rect.top) / rect.height;

    this.updatePrimarySize(size);
  }

  protected primaryPaneStyle(): Record<string, string> {
    return this.direction === "horizontal"
      ? { width: `${this.currentPrimarySize * 100}%` }
      : { height: `${this.currentPrimarySize * 100}%` };
  }

  protected secondaryPaneStyle(): Record<string, string> {
    const secondarySize = 1 - this.currentPrimarySize;
    return this.direction === "horizontal"
      ? { width: `${secondarySize * 100}%` }
      : { height: `${secondarySize * 100}%` };
  }

  private updatePrimarySize(nextSize: number): void {
    const clamped = this.clampSize(nextSize);
    if (clamped === this.currentPrimarySize) {
      return;
    }

    this.currentPrimarySize = clamped;
    this.primarySizeChange.emit(clamped);
  }

  private clampSize(size: number): number {
    const min = Math.max(0.05, this.minPrimarySize);
    const max = Math.min(0.95, 1 - this.minSecondarySize);
    return Math.min(max, Math.max(min, size));
  }
}
