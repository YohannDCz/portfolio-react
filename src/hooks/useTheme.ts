import { useEffect, useState } from 'react';

export interface ThemeHook {
  dark: boolean;
  setDark: (dark: boolean) => void;
}

export function useTheme(): ThemeHook {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [dark, setDark] = useState<boolean>(prefersDark);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.add('disable-transitions');

    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');

    const timeout = window.setTimeout(() => {
      root.classList.remove('disable-transitions');
    }, 1);

    return () => window.clearTimeout(timeout);
  }, [dark]);

  return { dark, setDark };
}
