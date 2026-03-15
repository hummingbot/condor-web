import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 pt-24">
      <p className="text-xs text-muted-foreground font-mono">404</p>
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">This page doesn&apos;t exist.</p>
      <Link href="/" className="text-sm hover:text-muted-foreground transition-colors">
        ← Back home
      </Link>
    </div>
  );
}
