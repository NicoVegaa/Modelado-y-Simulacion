import { simplify } from 'mathjs';
import type { LagrangeNode, LagrangeResult } from '../../types/numerical';
import { evaluateExpression } from '../mathParser';

const basisValue = (nodes: LagrangeNode[], i: number, x: number): number => {
  let value = 1;
  for (let j = 0; j < nodes.length; j += 1) {
    if (j !== i) {
      value *= (x - nodes[j].x) / (nodes[i].x - nodes[j].x);
    }
  }
  return value;
};

export const evaluateLagrange = (nodes: LagrangeNode[], x: number): number => {
  return nodes.reduce((acc, node, i) => acc + node.y * basisValue(nodes, i, x), 0);
};

const polynomialExpression = (nodes: LagrangeNode[]): string => {
  const terms = nodes.map((node, i) => {
    const numerators: string[] = [];
    let denominator = 1;

    nodes.forEach((other, j) => {
      if (j !== i) {
        numerators.push(`(x-(${other.x}))`);
        denominator *= node.x - other.x;
      }
    });

    return `${node.y}*(${numerators.join('*')})/(${denominator})`;
  });

  return terms.join('+');
};

interface LagrangeParams {
  nodes: LagrangeNode[];
  xStar: number;
  sourceFunction?: string;
  interval?: { min: number; max: number };
}

export const runLagrange = ({ nodes, xStar, sourceFunction, interval }: LagrangeParams): LagrangeResult => {
  const rawExpr = polynomialExpression(nodes);
  const simplified = simplify(rawExpr).toString();
  const yAtXStar = evaluateLagrange(nodes, xStar);

  if (!sourceFunction || !interval) {
    return {
      polynomialText: simplified,
      yAtXStar,
    };
  }

  const samples = 200;
  const step = (interval.max - interval.min) / samples;
  let globalError = 0;

  for (let i = 0; i <= samples; i += 1) {
    const x = interval.min + i * step;
    const fx = evaluateExpression(sourceFunction, x);
    const px = evaluateLagrange(nodes, x);
    globalError = Math.max(globalError, Math.abs(fx - px));
  }

  const localError = Math.abs(evaluateExpression(sourceFunction, xStar) - yAtXStar);

  return {
    polynomialText: simplified,
    yAtXStar,
    globalError,
    localError,
  };
};
