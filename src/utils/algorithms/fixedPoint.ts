import type { FixedPointIteration, FixedPointResult } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';

interface FixedPointParams {
  gExpression: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
}

export const runFixedPoint = ({
  gExpression,
  x0,
  tolerance,
  maxIterations,
}: FixedPointParams): FixedPointResult => {
  const iterations: FixedPointIteration[] = [];
  const cobwebSegments: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

  let xn = x0;
  let diverged = false;

  for (let n = 1; n <= maxIterations; n += 1) {
    const gxn = evaluateExpression(gExpression, xn);
    const error = Math.abs(gxn - xn);

    iterations.push({ n, xn, gxn, error });

    cobwebSegments.push({ x1: xn, y1: xn, x2: xn, y2: gxn });
    cobwebSegments.push({ x1: xn, y1: gxn, x2: gxn, y2: gxn });

    if (!Number.isFinite(gxn) || Math.abs(gxn) > 1e8) {
      diverged = true;
      break;
    }

    if (error < tolerance) {
      return {
        root: gxn,
        iterationsUsed: n,
        finalError: error,
        diverged,
        iterations,
        cobwebSegments,
      };
    }

    xn = gxn;
  }

  return {
    root: xn,
    iterationsUsed: iterations.length,
    finalError: iterations[iterations.length - 1]?.error ?? Number.NaN,
    diverged,
    iterations,
    cobwebSegments,
  };
};
