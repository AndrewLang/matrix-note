export type SvgDefinition = Readonly<{
  viewBox: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  body: string;
}>;

export class Svgs {
  static readonly menu: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>`
  };

  static readonly layoutSidebarInset: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<rect x="3" y="4" width="18" height="16" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M9 4v16"></path><path stroke-linecap="round" stroke-linejoin="round" d="m14 10 3 2-3 2"></path>`
  };

  static readonly layoutSidebarInsetReverse: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<rect x="3" y="4" width="18" height="16" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M15 4v16"></path><path stroke-linecap="round" stroke-linejoin="round" d="m10 10-3 2 3 2"></path>`
  };

  static readonly appLogo: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>`
  };

  static readonly search: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>`
  };

  static readonly settings: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>`
  };

  static readonly sun: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`
  };

  static readonly moon: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`
  };

  static readonly windowMinimize: SvgDefinition = {
    viewBox: "0 0 10 10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2",
    body: `<path d="M 0 5 L 10 5" />`
  };

  static readonly windowMaximize: SvgDefinition = {
    viewBox: "0 0 10 10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2",
    body: `<path d="M 1 1 L 9 1 L 9 9 L 1 9 Z" />`
  };

  static readonly windowClose: SvgDefinition = {
    viewBox: "0 0 10 10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.2",
    body: `<path d="M 1 1 L 9 9 M 9 1 L 1 9" />`
  };

  static readonly plus: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>`
  };

  static readonly close: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>`
  };

  static readonly bold: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M6 4h7a4 4 0 110 8H6zm0 8h8a4 4 0 010 8H6z"></path>`
  };

  static readonly italic: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M10 4h8M6 20h8M14 4L10 20"></path>`
  };

  static readonly heading: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M5 6v12M19 6v12M5 12h14"></path>`
  };

  static readonly quote: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 7H5v6h4V7zm10 0h-4v6h4V7z"></path>`
  };

  static readonly code: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M8 9l-4 3 4 3m8-6l4 3-4 3"></path>`
  };

  static readonly list: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"></path>`
  };

  static readonly numberedList: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M10 6h10M10 12h10M10 18h10M4 6h1v4M4 13h2l-2 3h2"></path>`
  };

  static readonly link: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M10 14a5 5 0 007.07 0l2.83-2.83a5 5 0 00-7.07-7.07L11 5m3 5a5 5 0 00-7.07 0L4.1 12.83a5 5 0 007.07 7.07L13 19"></path>`
  };

  static readonly image: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4-4 3 3 5-5 4 4M4 20h16V4H4v16zm4-11h.01"></path>`
  };

  static readonly preview: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>`
  };

  static readonly editor: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<rect x="3" y="4" width="18" height="16" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M8 8h8M8 12h5M8 16h8"></path>`
  };

  static readonly panelRight: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<rect x="3" y="4" width="18" height="16" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16"></path>`
  };

  static readonly panelTop: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<rect x="3" y="4" width="18" height="16" rx="2"></rect><path stroke-linecap="round" stroke-linejoin="round" d="M3 11h18"></path>`
  };

  static readonly chevronRight: SvgDefinition = {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    body: `<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />`
  };

  static readonly folderSolid: SvgDefinition = {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    body: `<path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>`
  };

  static readonly folderOutline: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>`
  };

  static readonly document: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>`
  };

  static readonly cloud: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>`
  };

  static readonly circlePlus: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<circle cx="12" cy="12" r="9"></circle><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v8M8 12h8"></path>`
  };

  static readonly codeBrackets: SvgDefinition = {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    body: `<path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>`
  };

  static readonly sparkles: SvgDefinition = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    body: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.7 4.8L18.5 9.5l-4.8 1.7L12 16l-1.7-4.8L5.5 9.5l4.8-1.7L12 3z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M19 3v4M21 5h-4M5 16v5M7.5 18.5h-5"></path>`
  };

  private static readonly registry: Record<string, SvgDefinition> = {
    menu: Svgs.menu,
    "layout-sidebar-inset": Svgs.layoutSidebarInset,
    "layout-sidebar-inset-reverse": Svgs.layoutSidebarInsetReverse,
    appLogo: Svgs.appLogo,
    search: Svgs.search,
    settings: Svgs.settings,
    sun: Svgs.sun,
    moon: Svgs.moon,
    windowMinimize: Svgs.windowMinimize,
    windowMaximize: Svgs.windowMaximize,
    windowClose: Svgs.windowClose,
    plus: Svgs.plus,
    close: Svgs.close,
    bold: Svgs.bold,
    italic: Svgs.italic,
    heading: Svgs.heading,
    quote: Svgs.quote,
    code: Svgs.code,
    list: Svgs.list,
    numberedList: Svgs.numberedList,
    link: Svgs.link,
    image: Svgs.image,
    preview: Svgs.preview,
    editor: Svgs.editor,
    panelRight: Svgs.panelRight,
    panelTop: Svgs.panelTop,
    chevronRight: Svgs.chevronRight,
    folderSolid: Svgs.folderSolid,
    folderOutline: Svgs.folderOutline,
    document: Svgs.document,
    cloud: Svgs.cloud,
    circlePlus: Svgs.circlePlus,
    codeBrackets: Svgs.codeBrackets,
    sparkles: Svgs.sparkles
  };

  static get(name: string): SvgDefinition | null {
    return Svgs.registry[name] ?? null;
  }
}
