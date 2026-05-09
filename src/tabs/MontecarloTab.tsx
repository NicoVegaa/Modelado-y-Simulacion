import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { monteCarloExamples } from '../data/examples';
import { runMonteCarlo, type MonteCarloMode } from '../utils/algorithms/montecarlo';
import { copyText, toCsv } from '../utils/csv';
import { formatNum, parseNumeric } from '../utils/number';
import type { MonteCarloResult } from '../types/numerical';

export const MontecarloTab = () => {
  const [mode, setMode] = useState<MonteCarloMode>('pi');
  const [expression, setExpression] = useState('sin(x)');
  const [secondExpression, setSecondExpression] = useState('0');
  const [a, setA] = useState('-1');
  const [b, setB] = useState('1');
  const [c, setC] = useState('-1');
  const [d, setD] = useState('1');
  const [n, setN] = useState('5000');
  const [seed, setSeed] = useState('');
  const [confidence, setConfidence] = useState<'90%' | '95%' | '99%' | '99.7%'>('95%');
  const [result, setResult] = useState<MonteCarloResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const applyExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = monteCarloExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setMode(selected.mode);
    setExpression(selected.expression ?? '');
    setSecondExpression(selected.secondExpression ?? '0');
    setA(String(selected.a));
    setB(String(selected.b));
    setC(String(selected.c ?? -1));
    setD(String(selected.d ?? 1));
    setN(String(selected.n));
    setSeed('');
    setConfidence(selected.confidence);
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const startTime = performance.now();
      const output = runMonteCarlo({
        mode,
        expression,
        secondExpression,
        a: parseNumeric(a),
        b: parseNumeric(b),
        c: parseNumeric(c),
        d: parseNumeric(d),
        n: Number(n),
        seed: seed.trim() ? parseNumeric(seed) : undefined,
        confidence,
      });
      const durationMs = performance.now() - startTime;
      setResult(output);
      setMessage('Simulacion completada.');
      setElapsedMs(durationMs);
    } catch (err) {
      setResult(null);
      setElapsedMs(null);
      setError(err instanceof Error ? err.message : 'No se pudo simular.');
    }
  };

  const insideOutside = useMemo(() => {
    if (!result) {
      return { inside: [], outside: [] } as { inside: Array<{ x: number; y: number }>; outside: Array<{ x: number; y: number }> };
    }
    return {
      inside: result.points.filter((p) => p.inside).map((p) => ({ x: p.x, y: p.y })),
      outside: result.points.filter((p) => !p.inside).map((p) => ({ x: p.x, y: p.y })),
    };
  }, [result]);

  const handleClear = () => {
    setMode('pi');
    setExpression('sin(x)');
    setSecondExpression('0');
    setA('-1');
    setB('1');
    setC('-1');
    setD('1');
    setN('5000');
    setSeed('');
    setConfidence('95%');
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
      toCsv(
        ['estimacion', 'media', 'varianza', 'desvio estandar', 'std error', 'ci low', 'ci high'],
        [[result.estimate, result.mean, result.variance, result.stdDev, result.stdError, result.ciLow, result.ciHigh]]
      )
    );
    setMessage('Resumen copiado en CSV.');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(320px,460px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Montecarlo</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => applyExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {monteCarloExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Tipo de simulacion
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={mode} onChange={(event) => setMode(event.target.value as MonteCarloMode)}>
            <option value="integral-simple">Integral simple</option>
            <option value="integral-doble">Integral doble</option>
            <option value="pi">Aproximacion de pi</option>
            <option value="area-curvas">Area entre curvas</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f(x) o f(x,y)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={expression} onChange={(event) => setExpression(event.target.value)} />
        </label>

        {mode === 'area-curvas' ? (
          <label className="block text-sm font-medium text-slate-700">
            Segunda curva
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={secondExpression} onChange={(event) => setSecondExpression(event.target.value)} />
          </label>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-slate-700">
            a
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={a} onChange={(event) => setA(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            b
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={b} onChange={(event) => setB(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            c
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={c} onChange={(event) => setC(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            d
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={d} onChange={(event) => setD(event.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-medium text-slate-700">
            Muestras n
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={n} onChange={(event) => setN(event.target.value)} />
            <FieldHint text="entero alto para menor varianza" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Seed (opcional)
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={seed} onChange={(event) => setSeed(event.target.value)} />
            <FieldHint text="mismo seed => mismos puntos aleatorios" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <label className="block text-sm font-medium text-slate-700">
            Confianza
            <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={confidence} onChange={(event) => setConfidence(event.target.value as '90%' | '95%' | '99%' | '99.7%')}>
              <option value="90%">90%</option>
              <option value="95%">95%</option>
              <option value="99%">99%</option>
              <option value="99.7%">99.7%</option>
            </select>
          </label>
        </div>

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
        <MethodFormulaInfo method="montecarlo" />

        {result ? (
          <ResultSummary
            title="Resumen estadistico"
            values={[
              { label: 'Estimacion', value: formatNum(result.estimate, 8) },
              { label: 'Media', value: formatNum(result.mean, 8) },
              { label: 'Varianza', value: formatNum(result.variance, 8) },
              { label: 'Desvio estandar', value: formatNum(result.stdDev, 8) },
              { label: 'Std. error', value: formatNum(result.stdError, 8) },
              { label: 'IC', value: `[${formatNum(result.ciLow, 8)}, ${formatNum(result.ciHigh, 8)}]` },
              { label: 'Tiempo de convergencia', value: elapsedMs !== null ? `${elapsedMs.toFixed(3)} ms` : 'N/A' },
            ]}
          />
        ) : null}

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Convergencia de la estimacion</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={result?.convergence ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="n" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="estimate" name="Estimacion" dot={false} stroke="#0284c7" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Puntos simulados</h3>
          <ResponsiveContainer width="100%" height="85%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
              <YAxis dataKey="y" type="number" domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Scatter data={insideOutside.inside} name="Dentro" fill="#16a34a" />
              <Scatter data={insideOutside.outside} name="Fuera" fill="#dc2626" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {result ? (
          <IterationTable
            headers={['n', 'estimacion']}
            rows={result.convergence.filter((_, idx) => idx % Math.ceil(result.convergence.length / 25) === 0).map((item) => [item.n, formatNum(item.estimate, 8)])}
          />
        ) : null}
      </div>
    </section>
  );
};
