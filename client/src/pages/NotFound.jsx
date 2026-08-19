import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[var(--surface)] text-[var(--text)] px-4 py-8">
    <div className="w-full max-w-xl rounded-[30px] border border-[var(--border)] bg-[var(--surface-muted)] p-10 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text)]">Page not found</h1>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--primary-hover)]"
      >
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
