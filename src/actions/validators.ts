/** Valida que un campo obligatorio no esté vacío. */
export function validateRequired(value: string, label: string): true | string {
  return value.trim() ? true : `${label} es obligatorio.`;
}

/** Valida una ruta relativa a la URL base. */
export function validateRelativePathInput(value: string): true | string {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Ingresá una ruta relativa, por ejemplo /partidas.';
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) {
    return 'La ruta debe ser relativa a la URL base.';
  }

  return true;
}

/** Valida el capítulo de una partida nueva. */
export function validateChapterInput(value: string): true | string {
  const trimmed = value.trim();

  if (!trimmed || trimmed.toLowerCase() === 'omitir') {
    return true;
  }

  if (!/^\d+$/.test(trimmed)) {
    return 'Ingresá un número entero, "omitir" o dejá vacío para usar el capítulo 1.';
  }

  return Number(trimmed) >= 1
    ? true
    : 'El capítulo debe ser un número entero positivo.';
}

/** Devuelve el capítulo a enviar; `undefined` indica omitir el body. */
export function parseChapterInput(value: string): number | undefined {
  const trimmed = value.trim();

  if (trimmed.toLowerCase() === 'omitir') {
    return undefined;
  }

  if (!trimmed) {
    return 1;
  }

  return Number(trimmed);
}

/** Valida un body JSON opcional. El texto vacío significa "sin body". */
export function validateJsonInput(value: string): true | string {
  if (!value.trim()) {
    return true;
  }

  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'formato inesperado';
    return `JSON inválido: ${detail}`;
  }
}

/** Valida la respuesta de un acertijo antes de enviarla. */
export function validateRiddleAnswer(value: string): true | string {
  if (!value.trim()) {
    return 'La respuesta no puede estar vacía.';
  }

  return value.length <= 200 ? true : 'La respuesta no puede superar los 200 caracteres.';
}
