export type TabId =
  | 'biseccion'
  | 'punto-fijo'
  | 'aitken'
  | 'newton-raphson'
  | 'lagrange'
  | 'dif-finitas'
  | 'newton-cotes'
  | 'montecarlo';

export interface BisectionIteration {
  n: number;
  a: number;
  b: number;
  c: number;
  fc: number;
  intervalWidth: number;
}

export interface BisectionResult {
  root: number;
  iterationsUsed: number;
  finalError: number;
  iterations: BisectionIteration[];
}

export interface NewtonIteration {
  n: number;
  xn: number;
  fxn: number;
  dfxn: number;
  xNext: number;
  error: number;
  significantDigits: number;
}

export interface NewtonResult {
  root: number;
  iterationsUsed: number;
  finalError: number;
  iterations: NewtonIteration[];
}

export interface FixedPointIteration {
  n: number;
  xn: number;
  gxn: number;
  error: number;
}

export interface FixedPointResult {
  root: number;
  iterationsUsed: number;
  finalError: number;
  diverged: boolean;
  iterations: FixedPointIteration[];
  cobwebSegments: Array<{ x1: number; y1: number; x2: number; y2: number }>;
}

export interface AitkenIteration {
  n: number;
  xn: number;
  xn1: number;
  xn2: number;
  xhat: number;
  difference: number;
}

export interface AitkenResult {
  iterations: AitkenIteration[];
}

export interface LagrangeNode {
  x: number;
  y: number;
}

export interface LagrangeResult {
  polynomialText: string;
  yAtXStar: number;
  globalError?: number;
  localError?: number;
}

export interface FiniteDifferenceRecord {
  x: number;
  fx: number;
  derivativeApprox: number;
  derivativeExact?: number;
  absoluteError?: number;
}

export interface NewtonCotesNodeRecord {
  x: number;
  fx: number;
  weight: number;
  contribution: number;
}

export interface NewtonCotesRuleResult {
  rule: string;
  estimate: number;
  exact?: number;
  truncationError?: number;
  nodes: NewtonCotesNodeRecord[];
}

export interface MonteCarloPoint {
  x: number;
  y: number;
  inside?: boolean;
}

export interface MonteCarloResult {
  estimate: number;
  stdDev: number;
  stdError: number;
  ciLow: number;
  ciHigh: number;
  convergence: Array<{ n: number; estimate: number }>;
  points: MonteCarloPoint[];
}

export interface Example<T> {
  label: string;
  value: T;
}
