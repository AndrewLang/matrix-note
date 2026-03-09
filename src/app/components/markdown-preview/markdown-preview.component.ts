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
  signal,
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

  readonly renderedHtml = signal("");
  private readonly isBrowser: boolean;
  private readonly markdown = new Marked({
    breaks: true,
    gfm: true
  });
  private readonly mermaidPrefixes = [
    "graph",
    "flowchart",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "stateDiagram-v2",
    "erDiagram",
    "journey",
    "gantt",
    "pie",
    "mindmap",
    "timeline",
    "gitGraph",
    "quadrantChart",
    "requirementDiagram",
    "xychart-beta",
    "block-beta",
    "packet-beta",
    "kanban",
    "C4Context",
    "C4Container",
    "C4Component",
    "C4Dynamic",
    "C4Deployment"
  ];
  private mermaidInitialized = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.markdown.use({
      renderer: {
        code: ({ text, lang }: Tokens.Code): string => {
          const language = (lang || "").trim().toLowerCase();
          if (language === "mermaid") {
            const escapedText = this.escapeHtml(text);

            return `<div class="mermaid-host"><div class="mermaid">${escapedText}</div><pre class="mermaid-fallback hidden"><code class="language-mermaid">${escapedText}</code></pre></div>`;
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
    const html = await this.markdown.parse(this.normalizeMarkdown(this.content || ""));
    this.renderedHtml.set(DOMPurify.sanitize(html));

    if (!this.isBrowser || !this.previewRoot) {
      return;
    }

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
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
      this.previewRoot.nativeElement.querySelectorAll<HTMLElement>(".mermaid-host")
    );

    for (const node of nodes) {
      const previewRoot = this.previewRoot?.nativeElement;
      if (!previewRoot) {
        continue;
      }

      const mermaidNode = node.querySelector<HTMLElement>(".mermaid");
      const fallbackNode = node.querySelector<HTMLElement>(".mermaid-fallback");
      const graphDefinition = (mermaidNode?.textContent ?? "").trim();
      if (!graphDefinition) {
        continue;
      }

      const id = `mermaid-${crypto.randomUUID()}`;
      const sandbox = document.createElement("div");
      sandbox.className = "hidden";
      previewRoot.appendChild(sandbox);

      try {
        if (!mermaidNode) {
          continue;
        }

        mermaidNode.id = id;
        await mermaid.run({ nodes: [mermaidNode] });

        const renderedSvg = mermaidNode.querySelector("svg");
        if (!renderedSvg || this.isMermaidErrorHtml(mermaidNode.innerHTML)) {
          throw new Error("Mermaid render failed");
        }

        node.classList.add("mermaid-render");
        fallbackNode?.remove();
      } catch {
        mermaidNode?.remove();
        fallbackNode?.classList.remove("hidden");
      } finally {
        mermaidNode?.removeAttribute("id");
        sandbox.remove();
        this.cleanupMermaidArtifacts(id);
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

  private normalizeMarkdown(content: string): string {
    const trimmed = content.trim();
    if (!trimmed || trimmed.startsWith("```")) {
      return content;
    }

    if (this.looksLikeStandaloneMermaid(trimmed)) {
      return `\`\`\`mermaid\n${trimmed}\n\`\`\``;
    }

    return content;
  }

  private looksLikeStandaloneMermaid(content: string): boolean {
    return this.mermaidPrefixes.some((prefix) => content.startsWith(prefix));
  }

  private isMermaidErrorSvg(svg: string): boolean {
    const probe = document.createElement("div");
    probe.innerHTML = svg;
    return this.isMermaidErrorElement(probe);
  }

  private isMermaidErrorHtml(html: string): boolean {
    const probe = document.createElement("div");
    probe.innerHTML = html;
    return this.isMermaidErrorElement(probe);
  }

  private isMermaidErrorElement(root: ParentNode): boolean {
    const errorSvg = root.querySelector('svg[aria-roledescription="error"]');
    if (errorSvg) {
      return true;
    }

    const errorText = root.querySelector(".error-text");
    if (errorText?.textContent?.toLowerCase().includes("syntax error")) {
      return true;
    }

    return root.textContent?.toLowerCase().includes("syntax error in text") ?? false;
  }

  private cleanupMermaidArtifacts(id: string): void {
    const previewRoot = this.previewRoot?.nativeElement;
    const artifactSelectors = [
      `#${CSS.escape(`d${id}`)}`,
      `#${CSS.escape(id)}`,
      "#cy",
      '[id^="dmermaid-"]',
      '[id^="mermaid-"]'
    ];

    for (const selector of artifactSelectors) {
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
      for (const element of elements) {
        if (previewRoot?.contains(element)) {
          continue;
        }

        if (element.id === "cy" && element.parentElement !== document.body) {
          continue;
        }

        element.remove();
      }
    }
  }
}
