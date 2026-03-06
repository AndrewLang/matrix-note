import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, signal } from "@angular/core";
import { WorkspaceTabComponent } from "./workspace-tab/workspace-tab.component";

type WorkspaceTab = {
  id: string;
  title: string;
  content: string;
  unsaved: boolean;
};

@Component({
  selector: "app-workspace",
  standalone: true,
  imports: [NgFor, NgIf, NgClass, WorkspaceTabComponent],
  templateUrl: "./workspace.component.html"
})
export class WorkspaceComponent {
  readonly tabs = signal<WorkspaceTab[]>([
    {
      id: "architecture",
      title: "Architecture.md",
      unsaved: true,
      content: `# Aero Design Architecture

## Core Philosophy
We believe an application should look as responsive as it feels. Taking inspiration from glassmorphism, we build layers of frosted depth over vibrant backdrops.

### Key Points:
1. **Fluid Typography:** Scales nicely on high DPI displays.
2. **Dynamic Theming:** Smooth transitions between \`Light Mode\` and \`Dark Mode\`.
3. **Subtle Elevation:** Dropshadows and translucent borders define structure without clutter.

\`\`\`js
// The toggle orchestrator
function switchTheme() {
    document.documentElement.classList.toggle('dark');
}
\`\`\`

> "Design is not just what it looks like and feels like. Design is how it works."
> - *Steve Jobs*

[View Figma Prototypes](https://figma.com/example)`
    },
    {
      id: "design-system",
      title: "Design-System.md",
      unsaved: false,
      content: `# Design System

## Tokens
- Colors
- Typography
- Spacing`
    }
  ]);

  readonly activeTabId = signal("architecture");
  private tabCount = 2;

  selectTab(id: string): void {
    this.activeTabId.set(id);
  }

  addTab(): void {
    this.tabCount += 1;
    const id = `new-tab-${this.tabCount}`;
    this.tabs.update((tabs) => [
      ...tabs,
      {
        id,
        title: `Untitled-${this.tabCount}.md`,
        unsaved: false,
        content: "# New Note\n\nStart writing..."
      }
    ]);
    this.activeTabId.set(id);
  }

  closeTab(id: string, event: MouseEvent): void {
    event.stopPropagation();
    const current = this.tabs();
    const index = current.findIndex((tab) => tab.id === id);
    if (index === -1) {
      return;
    }

    const next = current.filter((tab) => tab.id !== id);
    this.tabs.set(next);

    if (this.activeTabId() !== id) {
      return;
    }

    if (next.length === 0) {
      this.activeTabId.set("");
      return;
    }

    const fallbackIndex = Math.max(0, index - 1);
    this.activeTabId.set(next[fallbackIndex].id);
  }
}
