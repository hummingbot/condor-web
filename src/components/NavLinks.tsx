"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/chat", label: "Chat" },
  { href: "/agents", label: "Agents" },
  { href: "/competitions", label: "Competitions" },
  { href: "/keys", label: "Keys" },
];

const externalLinks = [
  { href: "https://docs.hummingbot.org", label: "Docs" },
  { href: "https://skills.hummingbot.org", label: "Skills" },
];

interface Props { mobile?: boolean }

export function NavLinks({ mobile }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded" aria-label="Menu">
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 pt-12">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2.5 text-sm rounded transition-colors",
                    active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="my-3 border-t border-border/50" />
            {externalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded"
              >
                {link.label} ↗
              </a>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

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
              active ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
