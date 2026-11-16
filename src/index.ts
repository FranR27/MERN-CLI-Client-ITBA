#!/usr/bin/env node
import { runApp } from './app.js';
import { theme } from './ui/theme.js';

/** @inquirer lanza ExitPromptError cuando el usuario cancela con Ctrl+C. */
function isPromptCancellation(error: unknown): boolean {
  return error instanceof Error && error.name === 'ExitPromptError';
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error(theme.danger('La aplicación necesita una terminal interactiva (TTY).'));
    console.error(theme.muted('Ejecutala directamente en tu terminal con: npm run dev'));
    process.exitCode = 1;
    return;
  }

  try {
    await runApp();
  } catch (error) {
    if (isPromptCancellation(error)) {
      console.log('');
      console.log(theme.muted('Operación cancelada. ¡Hasta luego!'));
      return;
    }

    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(theme.danger('Ocurrió un error inesperado al ejecutar la aplicación.'));
  console.error(theme.muted(error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
