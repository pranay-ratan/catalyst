import { Link, Outlet } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Brand dashboard' },
  { to: '/standards', label: 'Standards' },
] as const;

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-indigo focus:px-4 focus:py-2 focus:text-linen"
      >
        Skip to content
      </a>
      <DemoBanner />
      <header className="border-b border-ink/10 bg-linen">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4" aria-label="Main">
          <Link to="/" className="font-heading text-xl text-indigo no-underline" aria-label="ClearThread home">
            ClearThread
          </Link>
          <ul className="flex flex-wrap gap-4 text-base">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-ink no-underline hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function DemoBanner() {
  return (
    <div className="bg-indigo px-4 py-2 text-center text-base font-bold text-linen" role="status">
      Demo data. Not real test results.
    </div>
  );
}

function Footer() {
  return (
    <footer className="no-print border-t border-ink/10 bg-linen px-4 py-6 text-base text-muted">
      <div className="mx-auto max-w-5xl space-y-2">
        <p>ClearThread is a student concept and not an official certification.</p>
        <p>All brands, mills, labs and figures shown are fictional.</p>
      </div>
    </footer>
  );
}
