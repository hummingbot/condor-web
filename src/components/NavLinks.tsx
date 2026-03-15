"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/chat", label: "Chat" },
  { href: "/agents", label: "Agents" },
  { href: "/competitions", label: "Competitions" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {navLinks.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-2.5 py-1 text-xs rounded transition-colors",
              active
                ? "text-foreground bg-secondary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
