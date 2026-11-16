import pc from 'picocolors';

export const APP_NAME = 'MERN CLI Client';
export const APP_SUBTITLE = 'Cliente TUI para el backend de CASO 404';

/** Colores de la interfaz centralizados para mantener consistencia. */
export const theme = {
  title: (text: string) => pc.bold(pc.cyan(text)),
  accent: (text: string) => pc.cyan(text),
  subtitle: (text: string) => pc.gray(text),
  muted: (text: string) => pc.dim(text),
  success: (text: string) => pc.green(text),
  warning: (text: string) => pc.yellow(text),
  danger: (text: string) => pc.red(text),
};

export const jsonColors = {
  key: pc.cyan,
  string: pc.green,
  number: pc.yellow,
  literal: pc.magenta,
};

/** Verde para 2xx, amarillo para 4xx y rojo para 5xx. */
export function colorForStatus(status: number, text: string): string {
  if (status >= 200 && status < 300) {
    return theme.success(text);
  }

  if (status >= 400 && status < 500) {
    return theme.warning(text);
  }

  if (status >= 500) {
    return theme.danger(text);
  }

  return theme.accent(text);
}

export const symbols = {
  success: '✔',
  warning: '!',
  cross: '✖',
};
