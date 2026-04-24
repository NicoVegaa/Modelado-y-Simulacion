import { describe, expect, it } from 'vitest';
import { evaluateExpression } from './mathParser';

describe('evaluateExpression', () => {
  it('evalua log como logaritmo natural', () => {
    const value = evaluateExpression('log(e^2)', 0);
    expect(value).toBeCloseTo(2, 8);
  });

  it('acepta alias en mayuscula Log', () => {
    const value = evaluateExpression('Log(e^3)', 0);
    expect(value).toBeCloseTo(3, 8);
  });

  it('acepta alias ln y Ln', () => {
    const lnValue = evaluateExpression('ln(e^4)', 0);
    const lnUpperValue = evaluateExpression('Ln(e^5)', 0);

    expect(lnValue).toBeCloseTo(4, 8);
    expect(lnUpperValue).toBeCloseTo(5, 8);
  });
});
