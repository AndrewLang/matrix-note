import { DOCUMENT, NgClass, NgFor, NgIf } from "@angular/common";
import { Component, inject, signal } from "@angular/core";

@Component({
  selector: "app-tailwind-demo",
  standalone: true,
  imports: [NgClass, NgFor, NgIf],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div class="flex min-h-screen flex-col">
        <header
          class="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
            <div class="flex flex-1 items-center gap-3">
              <button
                type="button"
                (click)="toggleSidebar()"
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
              >
                <span class="sr-only">Toggle sidebar</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 7h14M5 12h10M5 17h14" />
                </svg>
              </button>

              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Matrix Note</p>
                <p class="text-lg font-semibold text-slate-900 dark:text-white">Workspace Shell</p>
              </div>
            </div>

            <div class="hidden flex-1 items-center justify-center md:flex">
              <label class="relative w-full max-w-sm">
                <span class="sr-only">Search</span>
                <span class="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm10 10-3.4-3.4" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search notes and tasks"
                  class="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-brand-500/40"
                />
              </label>
            </div>

            <div class="flex flex-1 items-center justify-end gap-3">
              <button
                type="button"
                (click)="toggleTheme()"
                class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <span class="h-2 w-2 rounded-full bg-slate-900 dark:hidden"></span>
                <span class="hidden h-2 w-2 rounded-full bg-amber-400 dark:inline-block"></span>
                {{ isDark() ? "Light" : "Dark" }} mode
              </button>

              <div class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white font-semibold shadow-brand-600/40 shadow-lg">
                AN
              </div>
            </div>
          </div>
        </header>

        <div class="mx-auto flex w-full max-w-7xl flex-1 gap-0 overflow-hidden">
          <aside
            class="absolute inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white/95 px-5 py-6 shadow-2xl transition-all duration-300 ease-out dark:border-slate-800 dark:bg-slate-900/95 lg:relative lg:translate-x-0"
            [ngClass]="{
              'translate-x-0': !sidebarCollapsed(),
              'lg:w-20 lg:px-3 lg:text-center': sidebarCollapsed(),
              'lg:w-64 lg:px-5 lg:text-left': !sidebarCollapsed()
            }"
          >
            <h2 class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Focus</h2>

            <nav class="mt-6 space-y-2">
              <a
                *ngFor="let item of navigation"
                href="javascript:void(0)"
                class="group flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:bg-slate-100/60 hover:text-slate-900 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                [ngClass]="{
                  'bg-slate-900 text-white shadow-sm shadow-slate-900/20 dark:bg-white dark:text-slate-900': item.active
                }"
              >
                <span
                  class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-white dark:group-hover:text-slate-900"
                >
                  {{ item.icon }}
                </span>
                <span
                  class="truncate text-sm font-semibold text-slate-800 transition dark:text-slate-100"
                  [ngClass]="{ 'lg:hidden': sidebarCollapsed(), 'lg:inline': !sidebarCollapsed() }"
                >
                  {{ item.label }}
                </span>

                <span
                  *ngIf="item.badge"
                  class="ml-auto rounded-full bg-slate-900/90 px-2 text-xs font-semibold text-white dark:bg-white/90 dark:text-slate-900"
                  [ngClass]="{ 'lg:hidden': sidebarCollapsed() }"
                >
                  {{ item.badge }}
                </span>
              </a>
            </nav>

            <div class="mt-auto space-y-4">
              <button
                type="button"
                class="w-full rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:bg-brand-50/80 hover:text-brand-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                [ngClass]="{ 'lg:hidden': sidebarCollapsed() }"
              >
                + New Collection
              </button>

              <div
                class="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-500 to-brand-600 px-4 py-5 text-white shadow-lg shadow-brand-600/40 dark:border-brand-400/30"
                [ngClass]="{ 'lg:hidden': sidebarCollapsed() }"
              >
                <p class="text-sm font-semibold">Need a break?</p>
                <p class="mt-1 text-xs text-white/80">
                  Capture quick thoughts from any device and sync later.
                </p>
              </div>
            </div>
          </aside>

          <main class="flex-1 overflow-y-auto bg-slate-50/70 px-4 py-6 text-sm dark:bg-slate-950/40 md:px-8">
            <div
              class="rounded-3xl border border-slate-200 bg-white/90 p-6 text-slate-900 shadow-lg shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100"
            >
              <div class="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">Today</p>
                  <h1 class="mt-2 text-3xl font-semibold tracking-tight">Clean application shell</h1>
                  <p class="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                    This skeleton keeps layout responsibilities isolated so product teams can drop actual features without
                    reworking structure, spacing, or theming.
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <span class="h-2 w-2 rounded-full bg-emerald-400"></span>
                    In sync
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/40 transition hover:bg-brand-500"
                  >
                    Add note
                  </button>
                </div>
              </div>
            </div>

            <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <article
                *ngFor="let stat of statCards"
                class="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">{{ stat.label }}</p>
                <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{{ stat.value }}</p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ stat.meta }}</p>
              </article>
            </section>

            <section class="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center justify-between">
                  <h2 class="text-base font-semibold text-slate-900 dark:text-white">Pinned notes</h2>
                  <button class="text-sm font-medium text-brand-600 hover:underline" type="button">View all</button>
                </div>

                <div class="space-y-4">
                  <article
                    *ngFor="let note of pinned"
                    class="rounded-2xl border border-slate-200/70 px-4 py-3 transition hover:border-brand-200 dark:border-slate-800/70"
                  >
                    <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ note.tag }}</p>
                    <p class="mt-1 text-lg font-semibold">{{ note.title }}</p>
                    <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ note.summary }}</p>
                  </article>
                </div>
              </div>

              <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 class="text-base font-semibold text-slate-900 dark:text-white">Timeline</h2>
                <ol class="space-y-5">
                  <li *ngFor="let item of timeline" class="relative pl-6">
                    <span class="absolute left-0 top-1 h-3 w-3 rounded-full border border-white bg-brand-500 shadow shadow-brand-500/40"></span>
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{{ item.time }}</p>
                    <p class="mt-1 text-sm font-semibold">{{ item.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">{{ item.description }}</p>
                  </li>
                </ol>
              </div>
            </section>
          </main>
        </div>

        <div
          *ngIf="!sidebarCollapsed()"
          class="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          (click)="toggleSidebar()"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  `
})
export class TailwindDemoComponent {
  private readonly document = inject(DOCUMENT);
  readonly isDark = signal(false);
  readonly sidebarCollapsed = signal(false);

  readonly navigation = [
    { label: "Overview", icon: "⌁", active: true },
    { label: "Tasks", icon: "☰", active: false, badge: "12" },
    { label: "Notes", icon: "✎", active: false, badge: "3" },
    { label: "Archive", icon: "⧉", active: false }
  ];

  readonly statCards = [
    { label: "Active notes", value: "128", meta: "+12 this week" },
    { label: "Focus time", value: "18h", meta: "Logged over 4 sessions" },
    { label: "Tasks cleared", value: "32", meta: "4 remaining today" }
  ];

  readonly pinned = [
    {
      title: "Platform system audit",
      summary: "Outline the next actions for dependency upgrades and release planning.",
      tag: "Product"
    },
    {
      title: "Research sync notes",
      summary: "Cluster qualitative insights from the latest discovery calls.",
      tag: "Research"
    },
    {
      title: "Visual refresh",
      summary: "Define the elevation tokens for modals and surfaces.",
      tag: "Design"
    }
  ];

  readonly timeline = [
    {
      title: "Strategy review",
      description: "Share the updated roadmap and KPIs with the team.",
      time: "09:30"
    },
    {
      title: "Foundry sync",
      description: "Confirm scope for the shared component library.",
      time: "12:00"
    },
    {
      title: "Daily shutdown",
      description: "Close loops, archive notes, and log the day.",
      time: "17:30"
    }
  ];

  constructor() {
    if (typeof window === "undefined") {
      return;
    }

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    this.isDark.set(prefersDark);
    this.document.documentElement.classList.toggle("dark", prefersDark);

    const collapseSidebar = window.matchMedia("(max-width: 1023px)").matches;
    this.sidebarCollapsed.set(collapseSidebar);
  }

  toggleTheme(): void {
    this.isDark.update((value) => {
      const next = !value;
      this.document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((value) => !value);
  }
}
