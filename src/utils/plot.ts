import { evaluateExpression } from './mathParser';

export const buildFunctionPoints = (
  expression: string,
  minX: number,
  maxX: number,
  samples = 120
): Array<{ x: number; y: number }> => {
  if (!expression.trim() || !Number.isFinite(minX) || !Number.isFinite(maxX) || minX >= maxX) {
    return [];
  }

  const step = (maxX - minX) / samples;
  const points: Array<{ x: number; y: number }> = [];

  for (let i = 0; i <= samples; i += 1) {
    const x = minX + i * step;
    const y = evaluateExpression(expression, x);
    points.push({ x, y });
  }

  return points;
};
