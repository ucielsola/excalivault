/// <reference types="wxt" />

declare module '#imports' {
  export function defineBackground(config: unknown): unknown;
  export function defineContentScript(config: unknown): unknown;
  export function defineSidepanel(config: unknown): unknown;
}

interface ImportMeta {
  readonly env: {
    readonly MANIFEST_VERSION: 2 | 3;
    readonly BROWSER: string;
    readonly CHROME: boolean;
    readonly FIREFOX: boolean;
    readonly SAFARI: boolean;
    readonly EDGE: boolean;
    readonly OPERA: boolean;
    readonly COMMAND: "build" | "serve";
    readonly ENTRYPOINT: string;
  };
}
