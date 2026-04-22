import { useMemo, useState } from 'react';
import { bisectionExamples } from '../data/examples';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { FunctionChart } from '../components/charts/FunctionChart';
import { runBisection } from '../utils/algorithms/bisection';
import { evaluateExpression } from '../utils/mathParser';
import { copyText, toCsv } from '../utils/csv';
import type { BisectionResult } from '../types/numerical';

const format = (value: number): string => value.toFixed(8);

export const BiseccionTab = () => {
  const [fx, setFx] = useState('sqrt(x)-cos(x)');
  const [a, setA] = useState('0');
  const [b, setB] = useState('1');
  const [tolerance, setTolerance] = useState('0.001');
  const [maxIterations, setMaxIterations] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BisectionResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleExampleChange = (index: string) => {
    if (!index) {
      return;
    }
    const selected = bisectionExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setFx(selected.fx);
    setA(String(selected.a));
    setB(String(selected.b));
    setTolerance(String(selected.tolerance));
    setMaxIterations(String(selected.maxIterations));
    setError(null);
    setMessage(null);
  };

  const handleCalculate = () => {
    setError(null);
    setMessage(null);

    const aValue = Number(a.replace(',', '.'));
    const bValue = Number(b.replace(',', '.'));
    const tolValue = Number(tolerance.replace(',', '.'));
    const maxIterValue = Number(maxIterations);

    if (!fx.trim()) {
      setError('Debe ingresar una funcion f(x).');
      return;
    }

    if ([aValue, bValue, tolValue, maxIterValue].some((value) => Number.isNaN(value))) {
      setError('Todos los campos numericos deben ser validos.');
      return;
    }

    if (aValue >= bValue) {
      setError('Intervalo invalido: debe cumplirse a < b.');
      return;
    }

    try {
      const output = runBisection({
        expression: fx,
        a: aValue,
        b: bValue,
        tolerance: tolValue,
        maxIterations: maxIterValue,
      });
      setResult(output);
      setMessage('Calculo completado correctamente.');
    } catch (algorithmError) {
      setResult(null);
      setError(algorithmError instanceof Error ? algorithmError.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setFx('');
    setA('');
    setB('');
    setTolerance('0.001');
    setMaxIterations('100');
    setResult(null);
    setError(null);
    setMessage(null);
  };

  const rows = useMemo(() => {
    if (!result) {
      return [];
    }

    return result.iterations.map((iteration) => [
      iteration.n,
      format(iteration.a),
      format(iteration.b),
      format(iteration.c),
      format(iteration.fc),
      format(iteration.intervalWidth),
    ]);
  }, [result]);

  const chartPoints = useMemo(() => {
    const aValue = Number(a.replace(',', '.'));
    const bValue = Number(b.replace(',', '.'));

    if (!Number.isFinite(aValue) || !Number.isFinite(bValue) || aValue >= bValue || !fx.trim()) {
      return [];
    }

    const samples = 120;
    const step = (bValue - aValue) / samples;
    const points: Array<{ x: number; y: number }> = [];

    for (let i = 0; i <= samples; i += 1) {
      const x = aValue + i * step;
      try {
        const y = evaluateExpression(fx, x);
        points.push({ x, y });
      } catch {
        return [];
      }
    }

    return points;
  }, [a, b, fx]);

  const handleCopyResults = async () => {
    if (!result) {
      setError('No hay resultados para copiar.');
      return;
    }

    try {
      const csv = toCsv(
        ['n', 'a', 'b', 'c', 'f(c)', '|b-a|'],
        result.iterations.map((iteration) => [
          iteration.n,
          iteration.a,
          iteration.b,
          iteration.c,
          iteration.fc,
          iteration.intervalWidth,
        ])
      );
      await copyText(csv);
      setMessage('Tabla copiada al portapapeles en formato CSV.');
    } catch {
      setError('No se pudo copiar al portapapeles en este navegador.');
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Biseccion</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            defaultValue=""
            onChange={(event) => handleExampleChange(event.target.value)}
          >
            <option value="">Seleccionar ejemplo</option>
            {bisectionExamples.map((example, index) => (
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
            placeholder="sqrt(x)-cos(x)"
          />
          <FieldHint text="usar operadores explicitos (*, /, ^) y funciones de math.js" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            a
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={a}
              onChange={(event) => setA(event.target.value)}
              placeholder="0"
            />
            <FieldHint text="decimal con coma o punto" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            b
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={b}
              onChange={(event) => setB(event.target.value)}
              placeholder="1"
            />
            <FieldHint text="debe ser mayor que a" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            Tolerancia
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={tolerance}
              onChange={(event) => setTolerance(event.target.value)}
              placeholder="0.001"
            />
            <FieldHint text="recomendado entre 1e-1 y 1e-8" />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Max. iteraciones
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={maxIterations}
              onChange={(event) => setMaxIterations(event.target.value)}
              placeholder="100"
            />
            <FieldHint text="entero positivo" />
          </label>
        </div>

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
      </div>

      <div className="space-y-4">
        {result ? (
          <ResultSummary
            title="Resultado final"
            values={[
              { label: 'Raiz aproximada', value: format(result.root) },
              { label: 'Iteraciones', value: String(result.iterationsUsed) },
              { label: 'Error final', value: format(result.finalError) },
            ]}
          />
        ) : null}

        {chartPoints.length > 0 ? (
          <FunctionChart
            title="f(x) en el intervalo"
            points={chartPoints}
            rootPoint={result ? { x: result.root, y: evaluateExpression(fx, result.root) } : undefined}
          />
        ) : null}

        {rows.length > 0 ? <IterationTable headers={['n', 'a', 'b', 'c=(a+b)/2', 'f(c)', '|b-a|']} rows={rows} /> : null}
      </div>
    </section>
  );
};
