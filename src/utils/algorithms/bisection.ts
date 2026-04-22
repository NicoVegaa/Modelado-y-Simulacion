import { evaluateExpression } from '../mathParser';
import type { BisectionIteration, BisectionResult } from '../../types/numerical';

interface BisectionParams {
  expression: string;
  a: number;
  b: number;
  tolerance: number;
  maxIterations: number;
}

export const runBisection = ({
  expression,
  a,
  b,
  tolerance,
  maxIterations,
}: BisectionParams): BisectionResult => {
  let left = a;
  let right = b;
  let fLeft = evaluateExpression(expression, left);
  let fRight = evaluateExpression(expression, right);

  if (fLeft * fRight > 0) {
    throw new Error('f(a) y f(b) deben tener signos contrarios para aplicar biseccion.');
  }

  const iterations: BisectionIteration[] = [];
  let root = left;
  let finalError = Math.abs(right - left);

  for (let n = 1; n <= maxIterations; n += 1) {
    const c = (left + right) / 2;
    const fC = evaluateExpression(expression, c);
    const intervalWidth = Math.abs(right - left);

    iterations.push({ n, a: left, b: right, c, fc: fC, intervalWidth });

    root = c;
    finalError = intervalWidth;

    if (Math.abs(fC) < tolerance || intervalWidth < tolerance) {
      return { root, iterationsUsed: n, finalError, iterations };
    }

    if (fLeft * fC < 0) {
      right = c;
      fRight = fC;
    } else {
      left = c;
      fLeft = fC;
    }

    if (!Number.isFinite(fRight)) {
      throw new Error('La evaluacion de la funcion en el intervalo genero valores invalidos.');
    }
  }

  return {
    root,
    iterationsUsed: iterations.length,
    finalError,
    iterations,
  };
};
