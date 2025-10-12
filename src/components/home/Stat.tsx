import type { JSX } from 'react';

interface StatProps {
  label: string;
  value: string | number;
}

export default function Stat({ label, value }: StatProps): JSX.Element {
  return (
    <div className="p-4 rounded-xl bg-muted/50 text-center sm:text-left">
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
