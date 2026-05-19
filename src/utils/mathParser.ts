import { create, all } from 'mathjs';

const math = create(all, {});

const normalizeDecimalCommas = (expression: string): string => {
  return expression.replace(/(\d),(\d)/g, '$1.$2');
};

const normalizeFunctionAliases = (expression: string): string => {
  return expression
    .replace(/\b(?:ln|Log|Ln)\s*\(/gi, 'log(')
    .replace(/\braiz\s*\(/gi, 'sqrt(');
};

export const evaluateExpression = (expression: string, x: number, y?: number): number => {
  const normalized = normalizeFunctionAliases(normalizeDecimalCommas(expression));
  const scope: { x: number; t: number; y?: number } = { x, t: x };
  if (typeof y === 'number') {
    scope.y = y;
  }

  const result = math.evaluate(normalized, scope);

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('La funcion devolvio un valor no numerico o no finito.');
  }

  return result;
};
