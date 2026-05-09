import type { NewtonCotesNodeRecord, NewtonCotesRuleResult } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';

export type NewtonCotesRule =
  | 'rect-izq'
  | 'rect-der'
  | 'rect-medio'
  | 'trapecio'
  | 'simpson-1-3'
  | 'simpson-3-8';

interface Params {
  expression: string;
  a: number;
  b: number;
  n: number;
  rules: NewtonCotesRule[];
  unknownParameterValue?: number;
}

const theoreticalErrorFromUnknownParameter = (rule: NewtonCotesRule, interval: number, h: number, unknown: number): number => {
  const magnitude = Math.abs(unknown);

  if (rule === 'rect-izq' || rule === 'rect-der') {
    return (interval / 2) * h * magnitude;
  }

  if (rule === 'rect-medio') {
    return (interval / 24) * h * h * magnitude;
  }

  if (rule === 'trapecio') {
    return (interval / 12) * h * h * magnitude;
  }

  if (rule === 'simpson-1-3') {
    return (interval / 180) * h ** 4 * magnitude;
  }

  return (interval / 80) * h ** 4 * magnitude;
};

const safeExactIntegral = (expression: string, a: number, b: number): number | undefined => {
  const samples = 5000;
  const h = (b - a) / samples;
  let sum = 0;
  for (let i = 0; i <= samples; i += 1) {
    const x = a + i * h;
    const fx = evaluateExpression(expression, x);
    const weight = i === 0 || i === samples ? 1 : i % 2 === 0 ? 2 : 4;
    sum += weight * fx;
  }
  return (h / 3) * sum;
};

const buildNodes = (expression: string, a: number, b: number, n: number): Array<{ x: number; fx: number }> => {
  const h = (b - a) / n;
  return Array.from({ length: n + 1 }, (_, i) => {
    const x = a + i * h;
    return { x, fx: evaluateExpression(expression, x) };
  });
};

export const runNewtonCotes = ({ expression, a, b, n, rules, unknownParameterValue }: Params): NewtonCotesRuleResult[] => {
  const exact = safeExactIntegral(expression, a, b);
  const interval = b - a;

  return rules.map((rule) => {
    const nodes = buildNodes(expression, a, b, n);
    const h = (b - a) / n;
    let estimate = 0;
    let weighted: NewtonCotesNodeRecord[] = [];
    let effectiveH = h;

    if (rule === 'rect-izq') {
      weighted = nodes.slice(0, -1).map((node) => ({ x: node.x, fx: node.fx, weight: h, contribution: node.fx * h }));
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    } else if (rule === 'rect-der') {
      weighted = nodes.slice(1).map((node) => ({ x: node.x, fx: node.fx, weight: h, contribution: node.fx * h }));
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    } else if (rule === 'rect-medio') {
      weighted = Array.from({ length: n }, (_, i) => {
        const x = a + (i + 0.5) * h;
        const fx = evaluateExpression(expression, x);
        return { x, fx, weight: h, contribution: fx * h };
      });
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    } else if (rule === 'trapecio') {
      weighted = nodes.map((node, i) => {
        const w = i === 0 || i === n ? h / 2 : h;
        return { x: node.x, fx: node.fx, weight: w, contribution: node.fx * w };
      });
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    } else if (rule === 'simpson-1-3') {
      const m = n % 2 === 0 ? n : n + 1;
      const nodesS = buildNodes(expression, a, b, m);
      const hs = (b - a) / m;
      effectiveH = hs;
      weighted = nodesS.map((node, i) => {
        const factor = i === 0 || i === m ? 1 : i % 2 === 0 ? 2 : 4;
        const weight = (hs / 3) * factor;
        return { x: node.x, fx: node.fx, weight, contribution: node.fx * weight };
      });
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    } else {
      const m = n % 3 === 0 ? n : n + (3 - (n % 3));
      const nodesS = buildNodes(expression, a, b, m);
      const hs = (b - a) / m;
      effectiveH = hs;
      weighted = nodesS.map((node, i) => {
        const factor = i === 0 || i === m ? 1 : i % 3 === 0 ? 2 : 3;
        const weight = ((3 * hs) / 8) * factor;
        return { x: node.x, fx: node.fx, weight, contribution: node.fx * weight };
      });
      estimate = weighted.reduce((acc, item) => acc + item.contribution, 0);
    }

    const truncationError = typeof exact === 'number' ? Math.abs(exact - estimate) : undefined;
    const theoreticalTruncationError =
      typeof unknownParameterValue === 'number'
        ? theoreticalErrorFromUnknownParameter(rule, interval, effectiveH, unknownParameterValue)
        : undefined;

    return {
      rule,
      estimate,
      exact,
      truncationError,
      theoreticalTruncationError,
      unknownParameterValue,
      nodes: weighted,
    };
  });
};
