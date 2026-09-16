import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/solid-router";
import { Suspense } from "solid-js";
import type { JSX } from "solid-js";
import { HydrationScript } from "solid-js/web";

import "../global.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Devframe × TanStack Start" },
      {
        name: "description",
        content:
          "A SolidJS + StyleX starter wired to TanStack Start, Query, Form, Table, Virtual, Store, and Devframe Hub.",
      },
    ],
    links: [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
  }),
  shellComponent: RootDocument,
});

function RootDocument(props: { children: JSX.Element }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
      },
    },
  });

  return (
    <html lang="zh-CN">
      <head>
        <HydrationScript />
        {import.meta.env.DEV ? (
          <>
            <link rel="stylesheet" href="/virtual:stylex.css" />
            <script type="module" src="/@id/virtual:stylex:runtime" />
          </>
        ) : null}
      </head>
      <body>
        <HeadContent />
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<div aria-live="polite">正在加载…</div>}>{props.children}</Suspense>
        </QueryClientProvider>
        <script type="module" src="/__devframes/embedded.js"></script>
        <Scripts />
      </body>
    </html>
  );
}
