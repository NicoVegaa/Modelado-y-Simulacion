import { useState } from 'react';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { newtonExamples } from '../data/examples';
import { runNewtonRaphson } from '../utils/algorithms/newtonRaphson';
import { copyText, toCsv } from '../utils/csv';
import type { NewtonResult } from '../types/numerical';

const format = (value: number): string => value.toFixed(10);

export const NewtonRaphsonTab = () => {
  const [fx, setFx] = useState('x^3 - 2*x - 5');
  const [dfx, setDfx] = useState('3*x^2 - 2');
  const [x0, setX0] = useState('1.5');
  const [tolerance, setTolerance] = useState('1e-8');
  const [maxIterations, setMaxIterations] = useState('50');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<NewtonResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const handleExampleChange = (index: string) => {
    if (!index) {
      return;
    }
    const selected = newtonExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setFx(selected.fx);
    setDfx(selected.dfx ?? '');
    setX0(String(selected.x0));
    setTolerance(String(selected.tolerance));
    setMaxIterations(String(selected.maxIterations));
    setError(null);
    setMessage(null);
  };

  const handleCalculate = () => {
    setError(null);
    setMessage(null);

    const x0Value = Number(x0.replace(',', '.'));
    const toleranceValue = Number(tolerance.replace(',', '.'));
    const maxIterValue = Number(maxIterations);

    if (!fx.trim()) {
      setError('Debe ingresar f(x).');
      return;
    }

    if ([x0Value, toleranceValue, maxIterValue].some((value) => Number.isNaN(value))) {
      setError('Los campos numericos contienen valores invalidos.');
      return;
    }

    try {
      const startTime = performance.now();
      const output = runNewtonRaphson({
        expression: fx,
        derivativeExpression: dfx.trim() || undefined,
        x0: x0Value,
        tolerance: toleranceValue,
        maxIterations: maxIterValue,
      });
      const durationMs = performance.now() - startTime;

      setResult(output);
      setMessage('Calculo completado correctamente.');
      setElapsedMs(durationMs);
    } catch (algorithmError) {
      setResult(null);
      setElapsedMs(null);
      setError(algorithmError instanceof Error ? algorithmError.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setFx('');
    setDfx('');
    setX0('');
    setTolerance('1e-8');
    setMaxIterations('50');
    setResult(null);
    setElapsedMs(null);
    setError(null);
    setMessage(null);
  };

  const rows = result
    ? result.iterations.map((iteration) => [
        iteration.n,
        format(iteration.xn),
        format(iteration.fxn),
        format(iteration.dfxn),
        format(iteration.xNext),
        format(iteration.error),
        iteration.significantDigits,
      ])
    : [];

  const handleCopyResults = async () => {
    if (!result) {
      setError('No hay resultados para copiar.');
      return;
    }

    try {
      const csv = toCsv(
        ['n', 'x_n', 'f(x_n)', "f'(x_n)", 'x_n+1', 'error', 'cifras significativas'],
        result.iterations.map((iteration) => [
          iteration.n,
          iteration.xn,
          iteration.fxn,
          iteration.dfxn,
          iteration.xNext,
          iteration.error,
          iteration.significantDigits,
        ])
      );
      await copyText(csv);
      setMessage('Tabla copiada al portapapeles en CSV.');
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Newton-Raphson</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue=""
            onChange={(event) => handleExampleChange(event.target.value)}
          >
            <option value="">Seleccionar ejemplo</option>
            {newtonExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f(x)
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={fx}
            onChange={(event) => setFx(event.target.value)}
          />
          <FieldHint text="acepta sin, cos, exp, log, sqrt, pi y e" />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f'(x) opcional
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={dfx}
            onChange={(event) => setDfx(event.target.value)}
            placeholder="si queda vacio se usa derivada numerica"
          />
          <FieldHint text="si queda vacio, se calcula con diferencias centrales" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            x0
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={x0}
              onChange={(event) => setX0(event.target.value)}
            />
            <FieldHint text="usar coma o punto decimal" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Tolerancia
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={tolerance}
              onChange={(event) => setTolerance(event.target.value)}
            />
            <FieldHint text="valor pequeno, por ejemplo 1e-8" />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Max. iteraciones
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={maxIterations}
            onChange={(event) => setMaxIterations(event.target.value)}
          />
          <FieldHint text="entero positivo" />
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
        {elapsedMs !== null ? <p className="rounded-md bg-sky-50 p-2 text-sm text-sky-700">Tiempo de convergencia: {elapsedMs.toFixed(3)} ms.</p> : null}
      </div>

      <div className="space-y-4">
        <MethodFormulaInfo method="newton-raphson" />

        {result ? (
          <ResultSummary
            title="Resultado final"
            values={[
              { label: 'Raiz aproximada', value: format(result.root) },
              { label: 'Iteraciones', value: String(result.iterationsUsed) },
              { label: 'Error final', value: format(result.finalError) },
              { label: 'Tiempo de convergencia', value: elapsedMs !== null ? `${elapsedMs.toFixed(3)} ms` : 'N/A' },
            ]}
          />
        ) : null}

        {rows.length > 0 ? (
          <IterationTable headers={['n', 'x_n', 'f(x_n)', "f'(x_n)", 'x_n+1', 'error', 'cifras sig.']} rows={rows} />
        ) : null}
      </div>
    </section>
  );
};
