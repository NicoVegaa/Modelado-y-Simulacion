import type { FiniteDifferenceRecord } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';

type Method = 'progresiva' | 'regresiva' | 'central';

interface Params {
  xValues: number[];
  h: number;
  order: 1 | 2;
  method: Method;
  expression?: string;
  yValues?: number[];
}

const getY = (x: number, expression?: string, yMap?: Map<number, number>): number => {
  if (expression) {
    return evaluateExpression(expression, x);
  }
  const value = yMap?.get(x);
  if (typeof value !== 'number') {
    throw new Error('Faltan datos de tabla para calcular derivadas.');
  }
  return value;
};

export const runFiniteDifferences = ({ xValues, h, order, method, expression, yValues }: Params): FiniteDifferenceRecord[] => {
  const yMap = yValues ? new Map(xValues.map((x, index) => [x, yValues[index]])) : undefined;

  return xValues.map((x, index) => {
    const useForward = method === 'progresiva' || (method === 'central' && index === 0);
    const useBackward = method === 'regresiva' || (method === 'central' && index === xValues.length - 1);

    const f = (target: number) => getY(target, expression, yMap);

    let derivativeApprox = Number.NaN;

    if (order === 1) {
      if (useForward) {
        derivativeApprox = (f(x + h) - f(x)) / h;
      } else if (useBackward) {
        derivativeApprox = (f(x) - f(x - h)) / h;
      } else {
        derivativeApprox = (f(x + h) - f(x - h)) / (2 * h);
      }
    } else {
      if (useForward) {
        derivativeApprox = (f(x + 2 * h) - 2 * f(x + h) + f(x)) / (h * h);
      } else if (useBackward) {
        derivativeApprox = (f(x) - 2 * f(x - h) + f(x - 2 * h)) / (h * h);
      } else {
        derivativeApprox = (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
      }
    }

    const fx = f(x);
    let derivativeExact: number | undefined;
    let absoluteError: number | undefined;

    if (expression) {
      const delta = 1e-6;
      derivativeExact =
        order === 1
          ? (evaluateExpression(expression, x + delta) - evaluateExpression(expression, x - delta)) / (2 * delta)
          :
            (evaluateExpression(expression, x + delta) -
              2 * evaluateExpression(expression, x) +
              evaluateExpression(expression, x - delta)) /
            (delta * delta);
      absoluteError = Math.abs(derivativeExact - derivativeApprox);
    }

    return {
      x,
      fx,
      derivativeApprox,
      derivativeExact,
      absoluteError,
    };
  });
};
