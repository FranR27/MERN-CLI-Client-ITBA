import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createActionHandlers } from '../src/actions/index.js';
import { MENU_OPTIONS } from '../src/ui/menu.js';

describe('opciones del menú principal', () => {
  it('respeta el orden y las nueve opciones de RF-02', () => {
    assert.deepEqual(
      MENU_OPTIONS.map((option) => option.value),
      [
        'health',
        'createGame',
        'getGame',
        'registerEvidence',
        'validateRiddle',
        'request',
        'history',
        'config',
        'exit',
      ],
    );
  });

  it('no repite identificadores ni etiquetas', () => {
    const values = MENU_OPTIONS.map((option) => option.value);
    const names = MENU_OPTIONS.map((option) => option.name);

    assert.equal(new Set(values).size, values.length);
    assert.equal(new Set(names).size, names.length);
  });

  it('incluye una etiqueta y una descripción en todas las opciones', () => {
    for (const option of MENU_OPTIONS) {
      assert.ok(option.name.trim().length > 0, `La opción ${option.value} no tiene nombre`);
      assert.ok(
        option.description.trim().length > 0,
        `La opción ${option.value} no tiene descripción`,
      );
    }
  });

  it('solo incluye rutas reales del backend de CASO 404', () => {
    const descriptions = MENU_OPTIONS.map((option) => option.description).join('\n');

    assert.match(descriptions, /\/health/);
    assert.match(descriptions, /\/partidas/);
    assert.match(descriptions, /\/partidas\/:id\/evidencias/);
    assert.match(descriptions, /\/partidas\/:id\/acertijos\/:acertijoId\/validar/);
    assert.doesNotMatch(descriptions, /\/usuarios/);
    assert.doesNotMatch(descriptions, /\/productos/);
    assert.doesNotMatch(descriptions, /(GET|POST|PUT|DELETE) \/evidencias\b/);
  });
});

describe('registro de acciones', () => {
  it('tiene un handler para cada opción navegable', () => {
    const handlers = createActionHandlers();

    for (const option of MENU_OPTIONS) {
      if (option.value === 'exit') {
        continue;
      }

      assert.equal(
        typeof handlers[option.value],
        'function',
        `Falta el handler de la opción ${option.value}`,
      );
    }
  });
});
