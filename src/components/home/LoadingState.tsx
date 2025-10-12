import type { JSX } from 'react';

export function LoadingSpinner(): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8 text-red-500">
      <p>Erreur: {message}</p>
    </div>
  );
}
