import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { Crepe } from "@milkdown/crepe";

@Component({
  selector: "mtx-markdown-editor",
  standalone: true,
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  templateUrl: "./markdown-editor.component.html"
})
export class MarkdownEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("scrollContainer") private scrollContainer?: ElementRef<HTMLDivElement>;
  @ViewChild("editorRoot") private editorRoot?: ElementRef<HTMLDivElement>;
  @Input() content = "";
  @Output() contentChange = new EventEmitter<string>();
  @Output() scrollProgressChange = new EventEmitter<number>();

  private crepe: Crepe | null = null;
  private readonly isBrowser: boolean;
  private lastKnownContent = "";

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    await this.mountEditor(this.content);
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!this.isBrowser || !changes["content"] || !this.crepe) {
      return;
    }

    const nextContent = this.content ?? "";
    if (nextContent === this.lastKnownContent) {
      return;
    }

    await this.mountEditor(nextContent);
  }

  async ngOnDestroy(): Promise<void> {
    await this.destroyEditor();
  }

  setScrollProgress(progress: number): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    container.scrollTop = maxScrollTop > 0 ? maxScrollTop * progress : 0;
  }

  protected handleScroll(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const progress = maxScrollTop > 0 ? container.scrollTop / maxScrollTop : 0;
    this.scrollProgressChange.emit(progress);
  }

  private async mountEditor(content: string): Promise<void> {
    const root = this.editorRoot?.nativeElement;
    if (!root) {
      return;
    }

    await this.destroyEditor();

    root.innerHTML = "";
    this.lastKnownContent = content;

    const crepe = new Crepe({
      root,
      defaultValue: content,
      features: {
        [Crepe.Feature.BlockEdit]: false,
        [Crepe.Feature.CodeMirror]: false,
        [Crepe.Feature.Cursor]: false,
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.Latex]: false,
        [Crepe.Feature.LinkTooltip]: false,
        [Crepe.Feature.ListItem]: false,
        [Crepe.Feature.Placeholder]: false,
        [Crepe.Feature.Table]: false,
        [Crepe.Feature.Toolbar]: false
      }
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        this.lastKnownContent = markdown;
        this.contentChange.emit(markdown);
      });
    });

    await crepe.create();
    this.crepe = crepe;
  }

  private async destroyEditor(): Promise<void> {
    if (!this.crepe) {
      return;
    }

    const editor = this.crepe;
    this.crepe = null;
    await editor.destroy();
  }
}
