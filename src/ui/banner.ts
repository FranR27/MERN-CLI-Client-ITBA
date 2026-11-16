import { APP_NAME, APP_SUBTITLE, theme } from './theme.js';

const WIDTH = 54;

/** Encabezado que se muestra al iniciar la aplicación. */
export function renderBanner(): string {
  const line = theme.accent('─'.repeat(WIDTH));

  return [
    line,
    `  ${theme.title(APP_NAME)}`,
    `  ${theme.subtitle(APP_SUBTITLE)}`,
    `  ${theme.muted('ITBA · SDD · Etapa 1')}`,
    line,
  ].join('\n');
}
