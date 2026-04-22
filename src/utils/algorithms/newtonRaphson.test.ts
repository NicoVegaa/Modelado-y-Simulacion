import { describe, expect, it } from 'vitest';
import { runNewtonRaphson } from './newtonRaphson';

describe('runNewtonRaphson', () => {
  it('converge usando derivada analitica', () => {
    const result = runNewtonRaphson({
      expression: 'x^2 - 2',
      derivativeExpression: '2*x',
      x0: 1,
      tolerance: 1e-10,
      maxIterations: 30,
    });

    expect(result.root).toBeCloseTo(Math.sqrt(2), 8);
    expect(result.iterationsUsed).toBeGreaterThan(0);
  });

  it('converge usando derivada numerica', () => {
    const result = runNewtonRaphson({
      expression: 'x^2 - 2',
      x0: 1,
      tolerance: 1e-10,
      maxIterations: 30,
    });

    expect(result.root).toBeCloseTo(Math.sqrt(2), 8);
  });
});
