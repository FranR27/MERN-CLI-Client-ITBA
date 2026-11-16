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

export const symbols = {
  pending: '•',
  info: 'i',
};
