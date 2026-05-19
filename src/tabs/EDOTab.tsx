import { useState } from 'react';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { FunctionChart } from '../components/charts/FunctionChart';
import { copyText, toCsv } from '../utils/csv';
import runEDO from '../utils/algorithms/edo';
import { edoExamples } from '../data/examples';
import type { EDOResultScalar } from '../types/numerical';

const format = (v: number) => v.toFixed(6);

export const EDOTab = () => {
  const [fexpr, setFexpr] = useState('y + t^2');
  const [t0, setT0] = useState('0');
  const [y0, setY0] = useState('1');
  const [tf, setTf] = useState('1');
  const [h, setH] = useState('0.1');
  const [method, setMethod] = useState<'euler' | 'heun' | 'rk4' | 'all'>('rk4');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<EDOResultScalar | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleExampleChange = (index: string) => {
    if (!index) return;
    const sel = edoExamples[Number(index)]?.value;
    if (!sel) return;
    setFexpr(sel.expression);
    setT0(String(sel.t0));
    setY0(String(sel.y0));
    setTf(String(sel.tf));
    setH(String(sel.h));
    setMethod(sel.method ?? 'rk4');
    setError(null);
    setMessage(null);
  };

  const handleCalculate = () => {
    setError(null);
    setMessage(null);

    const t0v = Number(t0.replace(',', '.'));
    const y0v = Number(y0.replace(',', '.'));
    const tfv = Number(tf.replace(',', '.'));
    const hv = Number(h.replace(',', '.'));

    if (!fexpr.trim()) {
      setError('Debe ingresar la expresion f(t,y).');
      return;
    }

    if ([t0v, y0v, tfv, hv].some((v) => Number.isNaN(v))) {
      setError('Campos numericos invalidos.');
      return;
    }

    if (hv <= 0) {
      setError('El paso h debe ser mayor que 0.');
      return;
    }

    try {
      const start = performance.now();
      const output = runEDO({ expression: fexpr, t0: t0v, y0: y0v, tf: tfv, h: hv, method });
      const duration = performance.now() - start;

      setResult(output as unknown as EDOResultScalar);
      setElapsedMs(duration);
      setMessage('Calculo completado.');
    } catch (e) {
      setResult(null);
      setElapsedMs(null);
      setError(e instanceof Error ? e.message : 'Error en el calculo');
    }
  };

  const handleClear = () => {
    setFexpr('');
    setT0('');
    setY0('');
    setTf('');
    setH('0.1');
    setResult(null);
    setElapsedMs(null);
    setError(null);
    setMessage(null);
  };

  const handleCopyResults = async () => {
    if (!result) {
      setError('No hay resultados para copiar.');
      return;
    }

    try {
      const csv = toCsv(
        ['n', 't', 'y'],
        result.iterations.map((it) => [it.n, it.t, it.y])
      );
      await copyText(csv);
      setMessage('Tabla copiada al portapapeles en CSV.');
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const rows = result
    ? result.iterations.map((it) => [it.n, format(it.t), format(it.y)])
    : [];

  const chartPoints = result ? result.iterations.map((it) => ({ x: it.t, y: it.y })) : [];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">EDO — Euler / Heun / RK4</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(e) => handleExampleChange(e.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {edoExamples.map((ex, idx) => (
              <option key={ex.label} value={idx}>
                {ex.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f(t,y)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={fexpr} onChange={(e) => setFexpr(e.target.value)} />
          <FieldHint text="Funciones: sin, cos, exp, log, sqrt, pi, e. Use variables t y y" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            t0
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={t0} onChange={(e) => setT0(e.target.value)} />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            y0
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={y0} onChange={(e) => setY0(e.target.value)} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            tf
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={tf} onChange={(e) => setTf(e.target.value)} />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Paso h
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={h} onChange={(e) => setH(e.target.value)} />
            <FieldHint text="Paso numerico, por ejemplo 0.1" />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Metodo
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={method} onChange={(e) => setMethod(e.target.value as any)}>
            <option value="euler">Euler</option>
            <option value="heun">Heun (RK2)</option>
            <option value="rk4">Runge-Kutta 4</option>
            <option value="all">Comparar (RK4 mostrado)</option>
          </select>
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={handleCalculate} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">
            Calcular
          </button>
          <button type="button" onClick={handleClear} className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">
            Limpiar
          </button>
          <button type="button" onClick={handleCopyResults} className="rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900">
            Copiar resultados
          </button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
        {elapsedMs !== null ? <p className="rounded-md bg-sky-50 p-2 text-sm text-sky-700">Tiempo: {elapsedMs.toFixed(3)} ms.</p> : null}
      </div>

      <div className="space-y-4">
        {result ? (
          <ResultSummary
            title="Resultado final"
            values={[
              { label: 'Metodo', value: result.method },
              { label: 't final', value: String(result.finalT) },
              { label: 'y(t final)', value: String(result.finalValue) },
            ]}
          />
        ) : null}

        {chartPoints.length > 0 ? <FunctionChart title="y(t)" points={chartPoints} /> : null}

        {rows.length > 0 ? <IterationTable headers={[ 'n', 't', 'y' ]} rows={rows} /> : null}
      </div>
    </section>
  );
};

export default EDOTab;
