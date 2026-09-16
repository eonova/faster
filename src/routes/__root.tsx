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
      { title: "Vite+ Starter — Build Better" },
      {
        name: "description",
        content:
          "A polished Vite+ starter with TanStack Start, SolidJS, StyleX, and the complete Devframe toolkit.",
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
