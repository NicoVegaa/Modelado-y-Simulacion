import type { MonteCarloPoint, MonteCarloResult } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';
import { confidenceToZ } from '../number';

export type MonteCarloMode = 'integral-simple' | 'integral-doble' | 'pi' | 'area-curvas';

interface BaseParams {
  mode: MonteCarloMode;
  n: number;
  confidence: string;
  expression?: string;
  secondExpression?: string;
  a: number;
  b: number;
  c?: number;
  d?: number;
}

const summarize = (samples: number[], confidence: string): Omit<MonteCarloResult, 'points' | 'convergence'> => {
  const mean = samples.reduce((acc, item) => acc + item, 0) / samples.length;
  const variance = samples.reduce((acc, item) => acc + (item - mean) ** 2, 0) / Math.max(1, samples.length - 1);
  const stdDev = Math.sqrt(variance);
  const stdError = stdDev / Math.sqrt(samples.length);
  const z = confidenceToZ(confidence);

  return {
    estimate: mean,
    stdDev,
    stdError,
    ciLow: mean - z * stdError,
    ciHigh: mean + z * stdError,
  };
};

export const runMonteCarlo = ({ mode, n, confidence, expression, secondExpression, a, b, c = 0, d = 1 }: BaseParams): MonteCarloResult => {
  const samples: number[] = [];
  const points: MonteCarloPoint[] = [];
  const convergence: Array<{ n: number; estimate: number }> = [];

  if (mode === 'integral-simple') {
    const width = b - a;
    for (let i = 1; i <= n; i += 1) {
      const x = a + Math.random() * width;
      const fx = evaluateExpression(expression ?? '0', x);
      samples.push(fx * width);
      points.push({ x, y: fx });
      const estimate = samples.reduce((acc, item) => acc + item, 0) / samples.length;
      convergence.push({ n: i, estimate });
    }
  } else if (mode === 'integral-doble') {
    const area = (b - a) * (d - c);
    for (let i = 1; i <= n; i += 1) {
      const x = a + Math.random() * (b - a);
      const y = c + Math.random() * (d - c);
      const fxy = evaluateExpression(expression ?? '0', x, y);
      samples.push(fxy * area);
      points.push({ x, y });
      const estimate = samples.reduce((acc, item) => acc + item, 0) / samples.length;
      convergence.push({ n: i, estimate });
    }
  } else if (mode === 'pi') {
    for (let i = 1; i <= n; i += 1) {
      const x = -1 + 2 * Math.random();
      const y = -1 + 2 * Math.random();
      const inside = x * x + y * y <= 1;
      samples.push(inside ? 4 : 0);
      points.push({ x, y, inside });
      const estimate = samples.reduce((acc, item) => acc + item, 0) / samples.length;
      convergence.push({ n: i, estimate });
    }
  } else {
    const yMin = Math.min(c, d);
    const yMax = Math.max(c, d);
    const boxArea = (b - a) * (yMax - yMin);

    for (let i = 1; i <= n; i += 1) {
      const x = a + Math.random() * (b - a);
      const y = yMin + Math.random() * (yMax - yMin);
      const y1 = evaluateExpression(expression ?? '0', x);
      const y2 = evaluateExpression(secondExpression ?? '0', x);
      const low = Math.min(y1, y2);
      const high = Math.max(y1, y2);
      const inside = y >= low && y <= high;
      samples.push(inside ? boxArea : 0);
      points.push({ x, y, inside });
      const estimate = samples.reduce((acc, item) => acc + item, 0) / samples.length;
      convergence.push({ n: i, estimate });
    }
  }

  return {
    ...summarize(samples, confidence),
    points,
    convergence,
  };
};
