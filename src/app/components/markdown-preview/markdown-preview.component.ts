import { isPlatformBrowser } from "@angular/common";
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { Marked, Tokens } from "marked";
import mermaid from "mermaid";

@Component({
  selector: "mtx-markdown-preview",
  host: {
    class: "flex h-full min-h-0 w-full flex-1"
  },
  templateUrl: "./markdown-preview.component.html"
})
export class MarkdownPreviewComponent implements AfterViewInit, OnChanges {
  @ViewChild("previewRoot") private previewRoot?: ElementRef<HTMLDivElement>;
  @Input() content = "";
  @Output() scrollProgressChange = new EventEmitter<number>();

  renderedHtml = "";
  private readonly isBrowser: boolean;
  private readonly markdown = new Marked({
    breaks: true,
    gfm: true
  });
  private mermaidInitialized = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.markdown.use({
      renderer: {
        code: ({ text, lang }: Tokens.Code): string => {
          const language = (lang || "").trim().toLowerCase();
          if (language === "mermaid") {
            return `<pre><code class="language-mermaid">${this.escapeHtml(text)}</code></pre>`;
          }

          const highlighted = language && hljs.getLanguage(language)
            ? hljs.highlight(text, { language }).value
            : this.escapeHtml(text);
          const className = language ? `hljs language-${language}` : "hljs";

          return `<pre><code class="${className}">${highlighted}</code></pre>`;
        }
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.renderContent();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (!changes["content"]) {
      return;
    }

    await this.renderContent();
  }

  setScrollProgress(progress: number): void {
    const root = this.previewRoot?.nativeElement;
    if (!root) {
      return;
    }

    const maxScrollTop = root.scrollHeight - root.clientHeight;
    root.scrollTop = maxScrollTop > 0 ? maxScrollTop * progress : 0;
  }

  protected handleScroll(): void {
    const root = this.previewRoot?.nativeElement;
    if (!root) {
      return;
    }

    const maxScrollTop = root.scrollHeight - root.clientHeight;
    const progress = maxScrollTop > 0 ? root.scrollTop / maxScrollTop : 0;
    this.scrollProgressChange.emit(progress);
  }

  private async renderContent(): Promise<void> {
    const html = await this.markdown.parse(this.content || "");
    this.renderedHtml = DOMPurify.sanitize(html);

    if (!this.isBrowser || !this.previewRoot) {
      return;
    }

    await new Promise<void>((resolve) => queueMicrotask(resolve));
    await this.renderMermaid();
  }

  private async renderMermaid(): Promise<void> {
    if (!this.previewRoot) {
      return;
    }

    if (!this.mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose"
      });
      this.mermaidInitialized = true;
    }

    const nodes = Array.from(
      this.previewRoot.nativeElement.querySelectorAll("code.language-mermaid")
    );

    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent) {
        continue;
      }

      const graphDefinition = node.textContent ?? "";
      const container = document.createElement("div");
      const id = `mermaid-${crypto.randomUUID()}`;

      try {
        const { svg } = await mermaid.render(id, graphDefinition);
        container.className = "mermaid-render";
        container.innerHTML = svg;
        parent.replaceWith(container);
      } catch {
        // Preserve the markdown code block if Mermaid fails to render.
      }
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
}
