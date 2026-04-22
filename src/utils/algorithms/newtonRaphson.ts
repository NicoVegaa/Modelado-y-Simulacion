import { evaluateExpression } from '../mathParser';
import type { NewtonIteration, NewtonResult } from '../../types/numerical';

interface NewtonParams {
  expression: string;
  derivativeExpression?: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
}

const numericalDerivative = (expression: string, x: number): number => {
  const h = 1e-6;
  const fPlus = evaluateExpression(expression, x + h);
  const fMinus = evaluateExpression(expression, x - h);
  return (fPlus - fMinus) / (2 * h);
};

export const runNewtonRaphson = ({
  expression,
  derivativeExpression,
  x0,
  tolerance,
  maxIterations,
}: NewtonParams): NewtonResult => {
  let xCurrent = x0;
  const iterations: NewtonIteration[] = [];

  const significantDigitsFromError = (err: number, reference: number): number => {
    if (!Number.isFinite(err) || err <= 0 || !Number.isFinite(reference) || reference === 0) {
      return 0;
    }
    const relErr = err / Math.abs(reference);
    if (relErr <= 0) {
      return 0;
    }
    return Math.max(0, Math.floor(-Math.log10(relErr)));
  };

  for (let n = 1; n <= maxIterations; n += 1) {
    const fxn = evaluateExpression(expression, xCurrent);
    const dfxn = derivativeExpression
      ? evaluateExpression(derivativeExpression, xCurrent)
      : numericalDerivative(expression, xCurrent);

    if (Math.abs(dfxn) < 1e-12) {
      throw new Error('La derivada es aproximadamente cero; no se puede continuar.');
    }

    const xNext = xCurrent - fxn / dfxn;
    const error = Math.abs(xNext - xCurrent);
    const significantDigits = significantDigitsFromError(error, xNext);

    iterations.push({ n, xn: xCurrent, fxn, dfxn, xNext, error, significantDigits });

    if (error < tolerance || Math.abs(fxn) < tolerance) {
      return {
        root: xNext,
        iterationsUsed: n,
        finalError: error,
        iterations,
      };
    }

    xCurrent = xNext;
  }

  return {
    root: xCurrent,
    iterationsUsed: iterations.length,
    finalError: iterations[iterations.length - 1]?.error ?? Number.NaN,
    iterations,
  };
};
