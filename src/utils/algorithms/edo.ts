import { evaluateExpression } from '../mathParser';

type Method = 'euler' | 'heun' | 'rk4' | 'all';

export interface RunEDOOptions {
  expression: string | string[]; // scalar expression or array for system
  t0: number;
  y0: number | number[];
  tf: number;
  h: number;
  method: Method;
  exactExpression?: string;
}

export function runEulerScalar(expression: string, t0: number, y0: number, tf: number, h: number) {
  const iterations: Array<{ n: number; t: number; y: number }> = [];
  const steps = Math.max(1, Math.ceil((tf - t0) / h));
  let t = t0;
  let y = y0;

  for (let n = 0; n <= steps; n++) {
    iterations.push({ n, t, y });
    const f = evaluateExpression(expression, t, y);
    y = y + h * f;
    t = t + h;
  }

  return iterations;
}

export function runHeunScalar(expression: string, t0: number, y0: number, tf: number, h: number) {
  const iterations: Array<{ n: number; t: number; y: number }> = [];
  const steps = Math.max(1, Math.ceil((tf - t0) / h));
  let t = t0;
  let y = y0;

  for (let n = 0; n <= steps; n++) {
    iterations.push({ n, t, y });
    const k1 = evaluateExpression(expression, t, y);
    const yPredict = y + h * k1;
    const k2 = evaluateExpression(expression, t + h, yPredict);
    y = y + (h / 2) * (k1 + k2);
    t = t + h;
  }

  return iterations;
}

export function runRK4Scalar(expression: string, t0: number, y0: number, tf: number, h: number) {
  const iterations: Array<{ n: number; t: number; y: number }> = [];
  const steps = Math.max(1, Math.ceil((tf - t0) / h));
  let t = t0;
  let y = y0;

  for (let n = 0; n <= steps; n++) {
    iterations.push({ n, t, y });
    const k1 = evaluateExpression(expression, t, y);
    const k2 = evaluateExpression(expression, t + h / 2, y + (h / 2) * k1);
    const k3 = evaluateExpression(expression, t + h / 2, y + (h / 2) * k2);
    const k4 = evaluateExpression(expression, t + h, y + h * k3);
    y = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
    t = t + h;
  }

  return iterations;
}

// Simple RK4 system solver for vector systems (array of expressions). Supports N-dim systems.
export function runRK4System(expressions: string[], t0: number, y0: number[], tf: number, h: number) {
  const iterations: Array<{ n: number; t: number; y: number[] }> = [];
  const steps = Math.max(1, Math.ceil((tf - t0) / h));
  let t = t0;
  let y = y0.slice();
  const nVars = expressions.length;

  for (let n = 0; n <= steps; n++) {
    iterations.push({ n, t, y: y.slice() });

    const k1 = new Array(nVars).fill(0).map((_, i) => evaluateExpression(expressions[i], t, y[i]));

    const yk2 = y.map((yi, i) => yi + (h / 2) * k1[i]);
    const k2 = new Array(nVars).fill(0).map((_, i) => evaluateExpression(expressions[i], t + h / 2, yk2[i]));

    const yk3 = y.map((yi, i) => yi + (h / 2) * k2[i]);
    const k3 = new Array(nVars).fill(0).map((_, i) => evaluateExpression(expressions[i], t + h / 2, yk3[i]));

    const yk4 = y.map((yi, i) => yi + h * k3[i]);
    const k4 = new Array(nVars).fill(0).map((_, i) => evaluateExpression(expressions[i], t + h, yk4[i]));

    y = y.map((yi, i) => yi + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
    t = t + h;
  }

  return iterations;
}

export function runEDO(options: RunEDOOptions) {
  const { expression, t0, y0, tf, h, method } = options;

  // scalar
  if (typeof expression === 'string' && typeof y0 === 'number') {
    let iterations: Array<{ n: number; t: number; y: number }> = [];
    const selected = method;

    if (selected === 'euler') {
      iterations = runEulerScalar(expression, t0, y0, tf, h);
    } else if (selected === 'heun') {
      iterations = runHeunScalar(expression, t0, y0, tf, h);
    } else if (selected === 'rk4') {
      iterations = runRK4Scalar(expression, t0, y0, tf, h);
    } else if (selected === 'all') {
      // for 'all' return RK4 by default but mark method 'all'
      iterations = runRK4Scalar(expression, t0, y0, tf, h);
    }

    const scalarIterations = iterations.map((it) => ({ n: it.n, t: it.t, y: it.y }));
    const final = scalarIterations[scalarIterations.length - 1];

    return {
      method: selected,
      iterations: scalarIterations,
      finalValue: final.y,
      finalT: final.t,
    };
  }

  // vector system
  if (Array.isArray(expression) && Array.isArray(y0)) {
    // only RK4System implemented for now
    const iterations = runRK4System(expression, t0, y0, tf, h);
    const final = iterations[iterations.length - 1];
    return {
      method: method,
      iterations: iterations.map((it) => ({ n: it.n, t: it.t, y: it.y })),
      finalValue: final.y.slice(),
      finalT: final.t,
    };
  }

  throw new Error('Invalid arguments for runEDO.');
}

export default runEDO;
