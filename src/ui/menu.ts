import { select } from '@inquirer/prompts';
import type { MenuActionId } from '../actions/types.js';

export interface MenuOption {
  value: MenuActionId;
  name: string;
  description: string;
}

/** Opciones del menú principal, en el orden definido por RF-02. */
export const MENU_OPTIONS: readonly MenuOption[] = [
  {
    value: 'health',
    name: 'Comprobar conexión con la API',
    description: 'GET /health y tiempo de respuesta',
  },
  {
    value: 'createGame',
    name: 'Crear una partida',
    description: 'POST /partidas (capítulo opcional)',
  },
  {
    value: 'getGame',
    name: 'Consultar una partida por ID',
    description: 'GET /partidas/:id',
  },
  {
    value: 'registerEvidence',
    name: 'Registrar una evidencia en una partida',
    description: 'POST /partidas/:id/evidencias',
  },
  {
    value: 'validateRiddle',
    name: 'Validar la respuesta de un acertijo',
    description: 'POST /partidas/:id/acertijos/:acertijoId/validar',
  },
  {
    value: 'request',
    name: 'Ejecutar una petición REST personalizada',
    description: 'Métodos GET, POST, PUT y DELETE',
  },
  {
    value: 'history',
    name: 'Consultar el historial de peticiones',
    description: 'Últimas 10 peticiones realizadas',
  },
  {
    value: 'config',
    name: 'Configurar o visualizar la URL base',
    description: 'Valor sugerido: http://localhost:3001/api',
  },
  {
    value: 'exit',
    name: 'Salir',
    description: 'Cerrar la aplicación',
  },
];

/** Firma del selector, inyectable para poder probar el bucle sin TTY. */
export type SelectMenuOption = (options: readonly MenuOption[]) => Promise<MenuActionId>;

/** Selector interactivo: flechas para navegar, Enter para elegir. */
export const selectMenuOption: SelectMenuOption = async (options) => {
  return select<MenuActionId>({
    message: '¿Qué querés hacer?',
    choices: options.map((option) => ({
      value: option.value,
      name: option.name,
      description: option.description,
      short: option.name,
    })),
    pageSize: options.length,
    loop: true,
  });
};
