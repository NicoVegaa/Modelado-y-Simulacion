import { describe, expect, it } from 'vitest';
import { runBisection } from './bisection';

describe('runBisection', () => {
  it('encuentra una raiz en intervalo valido', () => {
    const result = runBisection({
      expression: 'x^3 - 2*x - 5',
      a: 2,
      b: 3,
      tolerance: 1e-6,
      maxIterations: 100,
    });

    expect(result.root).toBeGreaterThan(2);
    expect(result.root).toBeLessThan(3);
    expect(result.finalError).toBeLessThan(1e-3);
  });

  it('falla cuando no hay cambio de signo', () => {
    expect(() =>
      runBisection({
        expression: 'x^2 + 1',
        a: -1,
        b: 1,
        tolerance: 1e-6,
        maxIterations: 20,
      })
    ).toThrow();
  });
});
