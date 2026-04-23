import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { aitkenExamples } from '../data/examples';
import { runAitken } from '../utils/algorithms/aitken';
import { copyText, toCsv } from '../utils/csv';
import { formatNum, parseNumeric } from '../utils/number';
import type { AitkenResult } from '../types/numerical';

export const AitkenTab = () => {
  const [gx, setGx] = useState('cos(x)');
  const [x0, setX0] = useState('0.5');
  const [iterationsToShow, setIterationsToShow] = useState('10');
  const [result, setResult] = useState<AitkenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = aitkenExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setGx(selected.gx);
    setX0(String(selected.x0));
    setIterationsToShow(String(selected.iterationsToShow));
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const output = runAitken({
        gExpression: gx,
        x0: parseNumeric(x0),
        iterationsToShow: Number(iterationsToShow),
      });
      setResult(output);
      setMessage('Calculo completado.');
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setGx('cos(x)');
    setX0('0.5');
    setIterationsToShow('10');
    setResult(null);
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
        ['n', 'x_n', 'x_hat_n', 'diferencia'],
        result.iterations.map((item) => [item.n, item.xn, item.xhat, item.difference])
      )
    );
    setMessage('Tabla copiada en CSV.');
  };

  const chartData = result
    ? result.iterations.map((item) => ({ n: item.n, xn: item.xn, xhat: item.xhat }))
    : [];

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Aceleracion de Aitken</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => handleExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {aitkenExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          g(x)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={gx} onChange={(event) => setGx(event.target.value)} />
          <FieldHint text="admite funciones math.js: sin, cos, exp, log" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          x0
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={x0} onChange={(event) => setX0(event.target.value)} />
          <FieldHint text="usar coma o punto para decimales" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Iteraciones a mostrar
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={iterationsToShow} onChange={(event) => setIterationsToShow(event.target.value)} />
          <FieldHint text="entero positivo, default 10" />
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
      </div>

      <div className="space-y-4">
        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">Convergencia comparada</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="n" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="xn" name="x_n" stroke="#0284c7" />
              <Line dataKey="xhat" name="x_hat_n" stroke="#ea580c" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {result ? (
          <IterationTable
            headers={['n', 'x_n', 'x_hat_n', 'diferencia']}
            rows={result.iterations.map((item) => [item.n, formatNum(item.xn), formatNum(item.xhat), formatNum(item.difference)])}
          />
        ) : null}
      </div>
    </section>
  );
};
