/* eslint-disable no-console */

// =====================================
// LIGHTWEIGHT DEBUG LOGGER
// =====================================

/**
 * Determine si nous devons journaliser les informations.
 * On garde les logs uniquement en developpement pour eviter le bruit en production.
 */
const shouldLog: boolean = process.env.NODE_ENV !== 'production';

type DebugContext = Record<string, unknown> | undefined;

/**
 * Point d'entrée principal pour un logging clair et structuré.
 * @param message Message a afficher dans la console de debug
 * @param context Contexte optionnel serialisable pour aider au diagnostic
 */
export function debugPrint(message: string, context?: DebugContext): void {
  if (!shouldLog) return;

  if (context && Object.keys(context).length > 0) {
    console.log(`[debug] ${message}`, context);
    return;
  }

  console.log(`[debug] ${message}`);
}

/**
 * Journalise proprement une erreur avec un message contextualisé.
 * @param error Erreur d'origine
 * @param message Message pour situer l'erreur
 * @param context Donnees additionnelles utiles pour reproduire/analyser
 */
export function debugError(error: unknown, message: string, context?: DebugContext): void {
  if (!shouldLog) return;

  console.error(`[error] ${message}`, {
    error,
    ...(context ?? {}),
  });
}


