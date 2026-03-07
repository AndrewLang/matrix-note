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
import { markdown } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";

@Component({
  selector: "mtx-markdown-editor",
  host: {
    class: "flex h-full min-h-0 w-full flex-1 flex-col"
  },
  templateUrl: "./markdown-editor.component.html"
})
export class MarkdownEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild("editorRoot") private editorRoot?: ElementRef<HTMLDivElement>;
  @Input() content = "";
  @Output() contentChange = new EventEmitter<string>();
  @Output() scrollProgressChange = new EventEmitter<number>();

  private editorView: EditorView | null = null;
  private readonly isBrowser: boolean;
  private lastKnownContent = "";
  private readonly editorTheme = EditorView.theme({
    "&": {
      height: "100%",
      backgroundColor: "transparent"
    },
    ".cm-scroller": {
      overflow: "auto",
      fontFamily: "inherit",
      lineHeight: "1.7"
    },
    ".cm-content, .cm-gutter": {
      minHeight: "100%"
    },
    ".cm-content": {
      padding: "1rem 2rem 4rem"
    },
    ".cm-line": {
      padding: "0"
    },
    ".cm-focused": {
      outline: "none"
    },
    ".cm-editor": {
      backgroundColor: "transparent"
    },
    ".cm-gutters": {
      display: "none",
      backgroundColor: "transparent",
      border: "none"
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "transparent"
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(59, 130, 246, 0.22)"
    }
  });
  private readonly darkThemeCompartment = EditorView.darkTheme.of(true);
  private readonly onScroll = () => this.emitScrollProgress();

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
    if (!this.isBrowser || !changes["content"] || !this.editorView) {
      return;
    }

    const nextContent = this.content ?? "";
    if (nextContent === this.lastKnownContent) {
      return;
    }

    this.editorView.dispatch({
      changes: {
        from: 0,
        to: this.editorView.state.doc.length,
        insert: nextContent
      }
    });
    this.lastKnownContent = nextContent;
  }

  async ngOnDestroy(): Promise<void> {
    await this.destroyEditor();
  }

  setScrollProgress(progress: number): void {
    const container = this.editorView?.scrollDOM;
    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    container.scrollTop = maxScrollTop > 0 ? maxScrollTop * progress : 0;
  }

  private async mountEditor(content: string): Promise<void> {
    const root = this.editorRoot?.nativeElement;
    if (!root) {
      return;
    }

    await this.destroyEditor();

    root.innerHTML = "";
    this.lastKnownContent = content;
    const isDarkMode = document.documentElement.classList.contains("dark");
    const state = EditorState.create({
      doc: content,
      extensions: [
        basicSetup,
        markdown(),
        EditorView.lineWrapping,
        this.editorTheme,
        isDarkMode ? oneDark : [],
        this.darkThemeCompartment,
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) {
            return;
          }

          const markdownContent = update.state.doc.toString();
          this.lastKnownContent = markdownContent;
          this.contentChange.emit(markdownContent);
        })
      ]
    });

    const editorView = new EditorView({
      state,
      parent: root
    });

    editorView.scrollDOM.addEventListener("scroll", this.onScroll, { passive: true });
    this.editorView = editorView;
  }

  private async destroyEditor(): Promise<void> {
    if (!this.editorView) {
      return;
    }

    const editor = this.editorView;
    editor.scrollDOM.removeEventListener("scroll", this.onScroll);
    this.editorView = null;
    editor.destroy();
  }

  private emitScrollProgress(): void {
    const container = this.editorView?.scrollDOM;
    if (!container) {
      return;
    }

    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const progress = maxScrollTop > 0 ? container.scrollTop / maxScrollTop : 0;
    this.scrollProgressChange.emit(progress);
  }
}
