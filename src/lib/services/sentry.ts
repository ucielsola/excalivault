import * as Sentry from "@sentry/svelte";

export interface SentryConfig {
  allowUrls?: (string | RegExp)[];
  beforeSend?: (
    event: Sentry.ErrorEvent,
    hint: Sentry.EventHint,
  ) => Sentry.ErrorEvent | Promise<Sentry.ErrorEvent | null> | null;
}

export function initSentry(overrides?: SentryConfig): void {
  Sentry.init({
    dsn: "https://d0f501eed5f94711af793a19f3a80fa0@app.glitchtip.com/20764",

    environment:
      import.meta.env.COMMAND === "serve" ? "development" : "production",

    tracesSampleRate: import.meta.env.COMMAND === "serve" ? 1.0 : 0.0,

    integrations: [Sentry.browserTracingIntegration()],

    tracePropagationTargets: ["https://excalidraw.com"],

    ...overrides,
  });
}

export function captureException(
  error: Error,
  context?: { serviceName?: string; methodName?: string },
): void {
  console.error(error);
  Sentry.captureException(error, {
    tags: {
      serviceName: context?.serviceName,
      methodName: context?.methodName,
    },
  });
}

export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
  context?: { serviceName?: string; methodName?: string },
): void {
  const consoleMethod =
    level === "error"
      ? console.error
      : level === "warning"
        ? console.warn
        : console.log;
  consoleMethod(message);
  Sentry.captureMessage(message, {
    level,
    tags: {
      serviceName: context?.serviceName,
      methodName: context?.methodName,
    },
  });
}
