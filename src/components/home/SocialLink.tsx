import type { JSX, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface SocialLinkProps {
  href?: string | null;
  icon: ReactNode;
  label: string;
}

export default function SocialLink({ href, icon, label }: SocialLinkProps): JSX.Element | null {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:bg-muted/50 transition"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowUpRight className="h-4 w-4" />
    </a>
  );
}
