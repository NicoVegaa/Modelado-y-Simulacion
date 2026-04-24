import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { fixedPointExamples } from '../data/examples';
import { runFixedPoint } from '../utils/algorithms/fixedPoint';
import { buildFunctionPoints } from '../utils/plot';
import { copyText, toCsv } from '../utils/csv';
import { formatNum, parseNumeric } from '../utils/number';
import type { FixedPointResult } from '../types/numerical';

export const PuntoFijoTab = () => {
  const [gx, setGx] = useState('exp(-x)');
  const [x0, setX0] = useState('0');
  const [tolerance, setTolerance] = useState('1e-4');
  const [maxIterations, setMaxIterations] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<FixedPointResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = fixedPointExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setGx(selected.gx);
    setX0(String(selected.x0));
    setTolerance(String(selected.tolerance));
    setMaxIterations(String(selected.maxIterations));
  };

  const handleCalculate = () => {
    setError(null);
    setMessage(null);
    try {
      const startTime = performance.now();
      const output = runFixedPoint({
        gExpression: gx,
        x0: parseNumeric(x0),
        tolerance: parseNumeric(tolerance),
        maxIterations: Number(maxIterations),
      });
      const durationMs = performance.now() - startTime;
      setResult(output);
      setElapsedMs(durationMs);
      if (output.diverged) {
        setMessage('Se detecto divergencia: la sucesion crece sin limite.');
      } else {
        setMessage('Calculo completado correctamente.');
      }
    } catch (err) {
      setResult(null);
      setElapsedMs(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setGx('exp(-x)');
    setX0('0');
    setTolerance('1e-4');
    setMaxIterations('100');
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
    const csv = toCsv(
      ['n', 'x_n', 'g(x_n)', '|x_{n+1}-x_n|'],
      result.iterations.map((item) => [item.n, item.xn, item.gxn, item.error])
    );
    await copyText(csv);
    setMessage('Tabla copiada en CSV.');
  };

  const chartData = useMemo(() => {
    try {
      if (!gx.trim()) {
        return [];
      }
      const fixedPoints = buildFunctionPoints(gx, -5, 5, 150);
      const diagonal = fixedPoints.map((item) => ({ ...item, yDiag: item.x }));
      return diagonal;
    } catch {
      return [];
    }
  }, [gx]);

  const cobwebData = useMemo(() => {
    if (!result) {
      return [] as Array<{ x: number; y: number }>;
    }
    return result.cobwebSegments.flatMap((segment) => [
      { x: segment.x1, y: segment.y1 },
      { x: segment.x2, y: segment.y2 },
    ]);
  }, [result]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Punto Fijo</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => handleExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {fixedPointExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          g(x)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={gx} onChange={(event) => setGx(event.target.value)} />
          <FieldHint text="usar coma o punto decimal en constantes" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            x0
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={x0} onChange={(event) => setX0(event.target.value)} />
            <FieldHint text="valor inicial cercano al punto fijo" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Tolerancia
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={tolerance} onChange={(event) => setTolerance(event.target.value)} />
            <FieldHint text="por ejemplo 1e-4" />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Max. iteraciones
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={maxIterations} onChange={(event) => setMaxIterations(event.target.value)} />
          <FieldHint text="entero positivo" />
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={handleCalculate}>
            Calcular
          </button>
          <button type="button" className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900" onClick={handleClear}>
            Limpiar
          </button>
          <button type="button" className="rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900" onClick={handleCopy}>
            Copiar resultados
          </button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
        {elapsedMs !== null ? <p className="rounded-md bg-sky-50 p-2 text-sm text-sky-700">Tiempo de convergencia: {elapsedMs.toFixed(3)} ms.</p> : null}
      </div>

      <div className="space-y-4">
        <MethodFormulaInfo method="punto-fijo" />

        {result ? (
          <ResultSummary
            title="Resultado final"
            values={[
              { label: 'Punto fijo', value: formatNum(result.root, 10) },
              { label: 'Iteraciones', value: String(result.iterationsUsed) },
              { label: 'Error final', value: formatNum(result.finalError, 10) },
              { label: 'Tiempo de convergencia', value: elapsedMs !== null ? `${elapsedMs.toFixed(3)} ms` : 'N/A' },
            ]}
          />
        ) : null}

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Cobweb plot: y=g(x) vs y=x</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} allowDuplicatedCategory={false} />
              <YAxis dataKey="y" type="number" domain={['auto', 'auto']} allowDuplicatedCategory={false} />
              <Tooltip />
              <Legend />
              <Line data={chartData} dataKey="y" dot={false} name="g(x)" stroke="#0284c7" />
              <Line data={chartData} dataKey="yDiag" dot={false} name="y=x" stroke="#475569" />
              <Line data={cobwebData} dataKey="y" dot={false} name="Cobweb" stroke="#dc2626" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {result ? (
          <IterationTable
            headers={['n', 'x_n', 'g(x_n)', '|x_{n+1}-x_n|']}
            rows={result.iterations.map((item) => [item.n, formatNum(item.xn), formatNum(item.gxn), formatNum(item.error)])}
          />
        ) : null}
      </div>
    </section>
  );
};
