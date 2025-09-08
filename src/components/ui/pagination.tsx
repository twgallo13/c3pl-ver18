import * as React from "react";
import { Link } from "react-router-dom";

// tiny class combiner
const cx = (...s: Array<string | false | null | undefined>) => s.filter(Boolean).join(" ");

type PaginationLinkProps =
  | { to: string; href?: never; isActive?: boolean; disabled?: boolean; className?: string; children: React.ReactNode }
  | { href: string; to?: never; isActive?: boolean; disabled?: boolean; className?: string; children: React.ReactNode }
  | { to?: never; href?: never; isActive?: boolean; disabled?: boolean; className?: string; children: React.ReactNode };

function PaginationLink({ to, href, isActive, disabled, className, children }: PaginationLinkProps) {
  const base = cx(
    "inline-flex items-center rounded-xl px-3 py-2 text-sm font-medium",
    isActive ? "ring-1 ring-foreground/20 bg-foreground/5" : "opacity-90 hover:opacity-100",
    disabled && "pointer-events-none opacity-50",
    className
  );

  if (to) {
    return (
      <Link to={to} className={base} aria-current={isActive ? "page" : undefined}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={base} aria-current={isActive ? "page" : undefined}>
        {children}
      </a>
    );
  }
  // pure non-link “button-like” element (no <Button> needed)
  return (
    <span role="button" className={base} aria-current={isActive ? "page" : undefined} aria-disabled={disabled}>
      {children}
    </span>
  );
}

export function Pagination({
  pages,
  current,
  makeTo,
  className,
}: {
  pages: number;
  current: number;
  makeTo: (page: number) => string;
  className?: string;
}) {
  const items = Array.from({ length: pages }, (_, i) => i + 1);
  return (
    <nav aria-label="Pagination" className={cx("flex items-center gap-2", className)}>
      {items.map((n) => (
        <PaginationLink key={n} to={makeTo(n)} isActive={n === current}>
          {n}
        </PaginationLink>
      ))}
    </nav>
  );
}

export default Pagination;
