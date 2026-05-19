import type { Example } from '../types/numerical';

export interface BisectionExampleValue {
  fx: string;
  a: number;
  b: number;
  tolerance: number;
  maxIterations: number;
}

export interface NewtonExampleValue {
  fx: string;
  dfx?: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
}

export interface FixedPointExampleValue {
  fx?: string;
  gx: string;
  x0: number;
  tolerance: number;
  maxIterations: number;
}

export interface AitkenExampleValue {
  gx: string;
  x0: number;
  iterationsToShow: number;
}

export interface LagrangeExampleValue {
  nodes: Array<{ x: number; y: number }>;
  sourceFunction?: string;
  intervalMin?: number;
  intervalMax?: number;
  xStar: number;
}

export interface FiniteDifferenceExampleValue {
  expression?: string;
  xList: string;
  h: number;
  order: 1 | 2;
  method: 'progresiva' | 'regresiva' | 'central';
  yList?: string;
}

export interface NewtonCotesExampleValue {
  fx: string;
  a: number;
  b: number;
  n: number;
  rules: Array<'rect-izq' | 'rect-der' | 'rect-medio' | 'trapecio' | 'simpson-1-3' | 'simpson-3-8'>;
}

export interface MonteCarloExampleValue {
  mode: 'integral-simple' | 'integral-doble' | 'pi' | 'area-curvas';
  expression?: string;
  secondExpression?: string;
  a: number;
  b: number;
  c?: number;
  d?: number;
  n: number;
  confidence: '90%' | '95%' | '99%' | '99.7%';
}

export const bisectionExamples: Example<BisectionExampleValue>[] = [
  {
    label: 'Ej 2a: 3(x+1)(x-0.5)(x-1)',
    value: { fx: '3*(x+1)*(x-0.5)*(x-1)', a: -1, b: 1.5, tolerance: 1e-3, maxIterations: 100 },
  },
  {
    label: 'Ej 3a: sqrt(x) - cos(x)',
    value: { fx: 'sqrt(x)-cos(x)', a: 0, b: 1, tolerance: 1e-3, maxIterations: 100 },
  },
  {
    label: 'Ej 4a: x^4 - 2x^3 - 4x^2 + 4x + 4',
    value: { fx: 'x^4 - 2*x^3 - 4*x^2 + 4*x + 4', a: -2, b: -1, tolerance: 1e-2, maxIterations: 100 },
  },
  {
    label: 'Ej 5a: (x+2)(x+1)(x-1)^3(x-2)',
    value: { fx: '(x+2)*(x+1)*(x-1)^3*(x-2)', a: -2.5, b: -1.5, tolerance: 1e-3, maxIterations: 100 },
  },
];

export const newtonExamples: Example<NewtonExampleValue>[] = [
  {
    label: 'Ej 2: x^3 - 2x - 5',
    value: { fx: 'x^3 - 2*x - 5', dfx: '3*x^2 - 2', x0: 1.5, tolerance: 1e-8, maxIterations: 50 },
  },
  {
    label: 'Ej 5: e^x + x^2 - 4',
    value: { fx: 'exp(x) + x^2 - 4', dfx: 'exp(x) + 2*x', x0: 0.5, tolerance: 1e-8, maxIterations: 50 },
  },
];

export const fixedPointExamples: Example<FixedPointExampleValue>[] = [
  {
    label: 'Ej 1: g(x)=cos(x)',
    value: { gx: 'cos(x)', x0: 0.5, tolerance: 1e-4, maxIterations: 100 },
  },
  {
    label: 'Ej 3: g(x)=e^(-x)',
    value: { gx: 'exp(-x)', x0: 0, tolerance: 1e-4, maxIterations: 100 },
  },
];

export const aitkenExamples: Example<AitkenExampleValue>[] = [
  {
    label: 'Aitken 1: g(x)=cos(x)',
    value: { gx: 'cos(x)', x0: 0.5, iterationsToShow: 10 },
  },
  {
    label: 'Aitken 2: g(x)=exp(-x)',
    value: { gx: 'exp(-x)', x0: 0, iterationsToShow: 10 },
  },
];

export const lagrangeExamples: Example<LagrangeExampleValue>[] = [
  {
    label: 'Ej 1: (1,1),(2,4),(3,9)',
    value: { nodes: [{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 9 }], xStar: 2.5 },
  },
  {
    label: 'Ej 9: sin(x) en [0,pi], grado 2',
    value: {
      nodes: [{ x: 0, y: 0 }, { x: 1.5707963268, y: 1 }, { x: 3.1415926536, y: 0 }],
      sourceFunction: 'sin(x)',
      intervalMin: 0,
      intervalMax: 3.1415926536,
      xStar: 1,
    },
  },
];

export const finiteDifferenceExamples: Example<FiniteDifferenceExampleValue>[] = [
  {
    label: 'Ej 1: f(x)=sin(x), x=[0,0.5,1,1.5,2]',
    value: { expression: 'sin(x)', xList: '0,0.5,1,1.5,2', h: 0.5, order: 1, method: 'central' },
  },
  {
    label: 'Ej 6: Tabla 1 posicion-tiempo',
    value: {
      xList: '0,1,2,3,4,5,6,7,8',
      yList: '0,1.9,4.2,7.8,12,17,25,32,42',
      h: 1,
      order: 1,
      method: 'central',
    },
  },
];

export const newtonCotesExamples: Example<NewtonCotesExampleValue>[] = [
  {
    label: 'Ej 1a: int(6+3cos(x)), trapecio n=4',
    value: { fx: '6+3*cos(x)', a: 0, b: 1.5707963268, n: 4, rules: ['trapecio'] },
  },
  {
    label: 'Ej 6: int(sin(x)), comparar reglas',
    value: {
      fx: 'sin(x)',
      a: 0,
      b: 3.1415926536,
      n: 10,
      rules: ['rect-medio', 'trapecio', 'simpson-1-3', 'simpson-3-8'],
    },
  },
];

export const monteCarloExamples: Example<MonteCarloExampleValue>[] = [
  {
    label: 'Ej 1: aproximacion de pi',
    value: { mode: 'pi', a: -1, b: 1, c: -1, d: 1, n: 10000, confidence: '95%' },
  },
  {
    label: 'Ej 5: int(sin(x)) [0,pi]',
    value: { mode: 'integral-simple', expression: 'sin(x)', a: 0, b: 3.1415926536, n: 10000, confidence: '95%' },
  },
];

export interface EDOExampleValue {
  expression: string;
  t0: number;
  y0: number;
  tf: number;
  h: number;
  method?: 'euler' | 'heun' | 'rk4' | 'all';
}

export const edoExamples: Example<EDOExampleValue>[] = [
  {
    label: 'Ej A1: dy/dt = y + t^2, y(0)=1, [0,1], h=0.1',
    value: { expression: 'y + t^2', t0: 0, y0: 1, tf: 1, h: 0.1, method: 'rk4' },
  },
  {
    label: 'Ej B1: dy/dt = y*sin(t), y(0)=2, [0,pi], h=0.314',
    value: { expression: 'y*sin(t)', t0: 0, y0: 2, tf: 3.1415926536, h: 0.31415926536, method: 'rk4' },
  },
];

export interface Sistemas1DExampleValue {
  expression: string;
  xmin: number;
  xmax: number;
  samples?: number;
}

export const sistemas1DExamples: Example<Sistemas1DExampleValue>[] = [
  { label: 'Ej 1: dx/dt = 2x (crecimiento exponencial)', value: { expression: '2*x', xmin: -5, xmax: 5, samples: 200 } },
  { label: 'Ej 2: Servidor dx/dt = x*(100-x)', value: { expression: 'x*(100-x)', xmin: -10, xmax: 110, samples: 300 } },
  { label: 'Ej 3: dx/dt = x^2 - 4 (silla-nodo)', value: { expression: 'x^2 - 4', xmin: -5, xmax: 5, samples: 200 } },
];
