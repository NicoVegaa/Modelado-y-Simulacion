import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { lagrangeExamples } from '../data/examples';
import type { LagrangeNode } from '../types/numerical';
import { copyText } from '../utils/csv';
import { runLagrange, evaluateLagrange } from '../utils/algorithms/lagrange';
import { buildFunctionPoints } from '../utils/plot';
import { formatNum, parseNumeric } from '../utils/number';

export const LagrangeTab = () => {
  const [nodes, setNodes] = useState<LagrangeNode[]>([
    { x: 1, y: 1 },
    { x: 2, y: 4 },
    { x: 3, y: 9 },
  ]);
  const [sourceFunction, setSourceFunction] = useState('');
  const [intervalMin, setIntervalMin] = useState('0');
  const [intervalMax, setIntervalMax] = useState('3');
  const [xStar, setXStar] = useState('2.5');
  const [result, setResult] = useState<ReturnType<typeof runLagrange> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const applyExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = lagrangeExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setNodes(selected.nodes);
    setXStar(String(selected.xStar));
    setSourceFunction(selected.sourceFunction ?? '');
    setIntervalMin(String(selected.intervalMin ?? 0));
    setIntervalMax(String(selected.intervalMax ?? 1));
  };

  const updateNode = (idx: number, key: 'x' | 'y', value: string) => {
    setNodes((prev) => prev.map((node, i) => (i === idx ? { ...node, [key]: parseNumeric(value) } : node)));
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const startTime = performance.now();
      const output = runLagrange({
        nodes,
        xStar: parseNumeric(xStar),
        sourceFunction: sourceFunction.trim() || undefined,
        interval: sourceFunction.trim() ? { min: parseNumeric(intervalMin), max: parseNumeric(intervalMax) } : undefined,
      });
      const durationMs = performance.now() - startTime;
      setResult(output);
      setMessage('Interpolacion calculada correctamente.');
      setElapsedMs(durationMs);
    } catch (err) {
      setResult(null);
      setElapsedMs(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setNodes([
      { x: 1, y: 1 },
      { x: 2, y: 4 },
      { x: 3, y: 9 },
    ]);
    setSourceFunction('');
    setIntervalMin('0');
    setIntervalMax('3');
    setXStar('2.5');
    setResult(null);
    setElapsedMs(null);
    setError(null);
    setMessage(null);
  };

  const handleCopy = async () => {
    if (!result) {
      setError('No hay resultados para copiar.');
      return;
    }
    await copyText(
      [
        `Polinomio: ${result.polynomialText}`,
        `P(x*): ${result.yAtXStar}`,
        `Error global: ${result.globalError ?? 'N/A'}`,
        `Error local: ${result.localError ?? 'N/A'}`,
      ].join('\n')
    );
    setMessage('Resultado copiado.');
  };

  const chartData = useMemo(() => {
    try {
      const min = parseNumeric(intervalMin);
      const max = parseNumeric(intervalMax);
      const left = Number.isFinite(min) ? min : Math.min(...nodes.map((n) => n.x));
      const right = Number.isFinite(max) ? max : Math.max(...nodes.map((n) => n.x));
      const points = buildFunctionPoints('x', left, right, 120).map(({ x }) => ({
        x,
        px: evaluateLagrange(nodes, x),
        fx: sourceFunction.trim() ? Number.NaN : Number.NaN,
      }));
      if (sourceFunction.trim()) {
        const fPoints = buildFunctionPoints(sourceFunction, left, right, 120);
        return points.map((item, idx) => ({ ...item, fx: fPoints[idx]?.y ?? Number.NaN }));
      }
      return points;
    } catch {
      return [];
    }
  }, [intervalMax, intervalMin, nodes, sourceFunction]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(330px,460px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Interpolacion de Lagrange</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => applyExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {lagrangeExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Nodos (x_i, y_i)</div>
          {nodes.map((node, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input className="rounded-md border border-slate-300 px-2 py-1" value={node.x} onChange={(event) => updateNode(idx, 'x', event.target.value)} />
              <input className="rounded-md border border-slate-300 px-2 py-1" value={node.y} onChange={(event) => updateNode(idx, 'y', event.target.value)} />
              <button
                type="button"
                className="rounded-md bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700"
                onClick={() => setNodes((prev) => prev.filter((_, i) => i !== idx))}
                disabled={nodes.length <= 2}
              >
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="rounded-md bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => setNodes((prev) => [...prev, { x: 0, y: 0 }])}>
            Agregar nodo
          </button>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Funcion opcional f(x)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={sourceFunction} onChange={(event) => setSourceFunction(event.target.value)} placeholder="sin(x)" />
          <FieldHint text="si se completa, se calculan errores global/local" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Intervalo min
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={intervalMin} onChange={(event) => setIntervalMin(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Intervalo max
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={intervalMax} onChange={(event) => setIntervalMax(event.target.value)} />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          x*
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={xStar} onChange={(event) => setXStar(event.target.value)} />
          <FieldHint text="punto de evaluacion del polinomio" />
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" type="button" onClick={handleCalculate}>
            Calcular
          </button>
          <button className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900" type="button" onClick={handleClear}>
            Limpiar
          </button>
          <button className="rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900" type="button" onClick={handleCopy}>
            Copiar resultados
          </button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
        {elapsedMs !== null ? <p className="rounded-md bg-sky-50 p-2 text-sm text-sky-700">Tiempo de convergencia: {elapsedMs.toFixed(3)} ms.</p> : null}
      </div>

      <div className="space-y-4">
        <MethodFormulaInfo method="lagrange" />

        {result ? (
          <ResultSummary
            title="Resultado interpolante"
            values={[
              { label: 'P(x*)', value: formatNum(result.yAtXStar, 10) },
              { label: 'Error global', value: result.globalError ? formatNum(result.globalError, 8) : 'N/A' },
              { label: 'Error local', value: result.localError ? formatNum(result.localError, 8) : 'N/A' },
              { label: 'Tiempo de convergencia', value: elapsedMs !== null ? `${elapsedMs.toFixed(3)} ms` : 'N/A' },
            ]}
          />
        ) : null}

        {result ? (
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Polinomio simplificado</h3>
            <p className="mt-2 break-all rounded-md bg-slate-50 p-2 font-mono text-xs text-slate-700">{result.polynomialText}</p>
          </div>
        ) : null}

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Grafico de interpolacion</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="px" name="P(x)" dot={false} stroke="#0284c7" />
              <Line dataKey="fx" name="f(x)" dot={false} stroke="#16a34a" />
              <Scatter data={nodes} dataKey="y" name="Nodos" fill="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <IterationTable headers={['x_i', 'y_i']} rows={nodes.map((node) => [formatNum(node.x), formatNum(node.y)])} />
      </div>
    </section>
  );
};
