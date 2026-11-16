import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseChapterInput,
  validateChapterInput,
  validateJsonInput,
  validateRelativePathInput,
  validateRequired,
  validateRiddleAnswer,
} from '../src/actions/validators.js';

describe('validadores de entrada', () => {
  it('exige los campos obligatorios', () => {
    assert.equal(validateRequired('abc', 'El ID'), true);
    assert.match(String(validateRequired('   ', 'El ID')), /obligatorio/);
  });

  it('valida rutas relativas', () => {
    assert.equal(validateRelativePathInput('/partidas/1'), true);
    assert.equal(validateRelativePathInput('partidas'), true);
    assert.match(String(validateRelativePathInput('')), /ruta relativa/);
    assert.match(String(validateRelativePathInput('https://otro.com/x')), /relativa/);
  });

  it('valida y interpreta el capítulo', () => {
    assert.equal(validateChapterInput('1'), true);
    assert.equal(validateChapterInput('omitir'), true);
    assert.equal(validateChapterInput(''), true);
    assert.match(String(validateChapterInput('abc')), /número entero/);
    assert.match(String(validateChapterInput('0')), /positivo/);
    assert.equal(parseChapterInput('3'), 3);
    assert.equal(parseChapterInput(''), 1);
    assert.equal(parseChapterInput('omitir'), undefined);
  });

  it('valida JSON opcional', () => {
    assert.equal(validateJsonInput(''), true);
    assert.equal(validateJsonInput('{"capitulo": 1}'), true);
    assert.match(String(validateJsonInput('{ roto')), /JSON inválido/);
  });

  it('valida la respuesta de un acertijo', () => {
    assert.equal(validateRiddleAnswer('una respuesta'), true);
    assert.match(String(validateRiddleAnswer('   ')), /no puede estar vacía/);
    assert.match(String(validateRiddleAnswer('x'.repeat(201))), /200 caracteres/);
  });
});
