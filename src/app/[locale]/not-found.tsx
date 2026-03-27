import { Link } from "@/i18n/routing";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h1 className="text-8xl font-extrabold text-mint-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 text-sm font-medium bg-mint-500 text-white rounded-lg
                   hover:bg-mint-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
