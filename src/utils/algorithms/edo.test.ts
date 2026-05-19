import { describe, expect, it } from 'vitest';
import { runRK4Scalar } from './edo';

describe('runRK4Scalar', () => {
  it('aproxima dy/dt = y con y(0)=1 -> y(1)=e', () => {
    const expr = 'y';
    const t0 = 0;
    const y0 = 1;
    const tf = 1;
    const h = 0.1;

    const iters = runRK4Scalar(expr, t0, y0, tf, h);
    const last = iters[iters.length - 1];
    const approx = last.y;
    const exact = Math.E;

    // expect error under 1e-3
    expect(Math.abs(approx - exact)).toBeLessThan(1e-3);
  });
});
