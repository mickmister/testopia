import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Testopia Task Board' },
    ],
  }),
  component: Root,
  shellComponent: Document,
});

function Root() {
  return <Outlet />;
}

function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body style={{ fontFamily: 'system-ui', maxWidth: 640, margin: '3rem auto', padding: '0 1rem' }}>
        {children}
        <Scripts />
        {/* SPA mode needs the dev client entry executed, not just preloaded. */}
        {import.meta.env.DEV && <script type="module" src="/@id/virtual:tanstack-start-dev-client-entry" /> }
      </body>
    </html>
  );
}
