import { describe, expect, it } from 'vitest';
import { runMonteCarlo } from './montecarlo';

describe('runMonteCarlo seed', () => {
  it('produce resultados reproducibles con la misma semilla', () => {
    const first = runMonteCarlo({
      mode: 'pi',
      n: 300,
      confidence: '95%',
      a: -1,
      b: 1,
      c: -1,
      d: 1,
      seed: 12345,
    });

    const second = runMonteCarlo({
      mode: 'pi',
      n: 300,
      confidence: '95%',
      a: -1,
      b: 1,
      c: -1,
      d: 1,
      seed: 12345,
    });

    expect(second.estimate).toBe(first.estimate);
    expect(second.stdDev).toBe(first.stdDev);
    expect(second.convergence).toEqual(first.convergence);
    expect(second.points).toEqual(first.points);
  });
});
