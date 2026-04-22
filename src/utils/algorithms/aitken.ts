import type { AitkenIteration, AitkenResult } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';

interface AitkenParams {
  gExpression: string;
  x0: number;
  iterationsToShow: number;
}

export const runAitken = ({ gExpression, x0, iterationsToShow }: AitkenParams): AitkenResult => {
  const values: number[] = [x0];

  for (let i = 0; i < iterationsToShow + 2; i += 1) {
    const next = evaluateExpression(gExpression, values[values.length - 1]);
    values.push(next);
  }

  const iterations: AitkenIteration[] = [];

  for (let n = 0; n < iterationsToShow; n += 1) {
    const xn = values[n];
    const x1 = values[n + 1];
    const x2 = values[n + 2];
    const denom = x2 - 2 * x1 + xn;
    const xhat = Math.abs(denom) < 1e-12 ? Number.NaN : xn - ((x1 - xn) ** 2) / denom;
    const difference = Number.isFinite(xhat) ? Math.abs(xhat - x2) : Number.NaN;
    iterations.push({ n: n + 1, xn, xhat, difference });
  }

  return { iterations };
};
