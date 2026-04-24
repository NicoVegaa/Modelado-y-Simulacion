import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { ResultSummary } from '../components/common/ResultSummary';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { newtonCotesExamples } from '../data/examples';
import { runNewtonCotes, type NewtonCotesRule } from '../utils/algorithms/newtonCotes';
import { copyText, toCsv } from '../utils/csv';
import { buildFunctionPoints } from '../utils/plot';
import { formatNum, parseNumeric } from '../utils/number';

const allRules: Array<{ id: NewtonCotesRule; label: string }> = [
  { id: 'rect-izq', label: 'Rectangulo izquierdo' },
  { id: 'rect-der', label: 'Rectangulo derecho' },
  { id: 'rect-medio', label: 'Rectangulo medio' },
  { id: 'trapecio', label: 'Trapecio' },
  { id: 'simpson-1-3', label: 'Simpson 1/3' },
  { id: 'simpson-3-8', label: 'Simpson 3/8' },
];

export const NewtonCotesTab = () => {
  const [fx, setFx] = useState('sin(x)');
  const [a, setA] = useState('0');
  const [b, setB] = useState('3.1415926536');
  const [n, setN] = useState('10');
  const [selectedRules, setSelectedRules] = useState<NewtonCotesRule[]>(['trapecio']);
  const [results, setResults] = useState<ReturnType<typeof runNewtonCotes>>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const applyExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = newtonCotesExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setFx(selected.fx);
    setA(String(selected.a));
    setB(String(selected.b));
    setN(String(selected.n));
    setSelectedRules(selected.rules);
  };

  const toggleRule = (rule: NewtonCotesRule) => {
    setSelectedRules((prev) =>
      prev.includes(rule) ? prev.filter((item) => item !== rule) : [...prev, rule]
    );
  };

  const handleCalculate = () => {
    setError(null);
    try {
      if (selectedRules.length === 0) {
        throw new Error('Seleccione al menos una regla de cuadratura.');
      }
      const startTime = performance.now();
      const output = runNewtonCotes({
        expression: fx,
        a: parseNumeric(a),
        b: parseNumeric(b),
        n: Number(n),
        rules: selectedRules,
      });
      const durationMs = performance.now() - startTime;
      setResults(output);
      setMessage('Integrales calculadas correctamente.');
      setElapsedMs(durationMs);
    } catch (err) {
      setResults([]);
      setElapsedMs(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular.');
    }
  };

  const handleClear = () => {
    setFx('sin(x)');
    setA('0');
    setB('3.1415926536');
    setN('10');
    setSelectedRules(['trapecio']);
    setResults([]);
    setElapsedMs(null);
    setError(null);
    setMessage(null);
  };

  const handleCopy = async () => {
    if (results.length === 0) {
      setError('No hay resultados para copiar.');
      return;
    }
    await copyText(
      toCsv(
        ['regla', 'estimacion', 'valor exacto', 'error'],
        results.map((item) => [item.rule, item.estimate, item.exact ?? '', item.truncationError ?? ''])
      )
    );
    setMessage('Comparacion copiada en CSV.');
  };

  const chartPoints = useMemo(() => {
    try {
      const aValue = parseNumeric(a);
      const bValue = parseNumeric(b);
      if (!Number.isFinite(aValue) || !Number.isFinite(bValue) || aValue >= bValue || !fx.trim()) {
        return [];
      }
      return buildFunctionPoints(fx, aValue, bValue, 120);
    } catch {
      return [];
    }
  }, [fx, a, b]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(320px,460px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Reglas de Newton-Cotes</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => applyExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {newtonCotesExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f(x)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={fx} onChange={(event) => setFx(event.target.value)} />
          <FieldHint text="acepta funciones: sin, cos, exp, log, sqrt" />
        </label>

        <div className="grid grid-cols-3 gap-2">
          <label className="block text-sm font-medium text-slate-700">
            a
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={a} onChange={(event) => setA(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            b
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={b} onChange={(event) => setB(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            n
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={n} onChange={(event) => setN(event.target.value)} />
          </label>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <div className="mb-2 text-sm font-medium text-slate-700">Reglas a aplicar (comparacion multiple)</div>
          <div className="grid grid-cols-2 gap-2">
            {allRules.map((rule) => (
              <label key={rule.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={selectedRules.includes(rule.id)} onChange={() => toggleRule(rule.id)} />
                {rule.label}
              </label>
            ))}
          </div>
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
        <MethodFormulaInfo method="newton-cotes" />

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">f(x) y area aproximada</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="y" name="f(x)" dot={false} stroke="#0284c7" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {results.length > 0 ? (
          <ResultSummary
            title="Comparacion de reglas"
            values={[
              ...results.slice(0, 2).map((item) => ({
                label: item.rule,
                value: `${formatNum(item.estimate, 8)} (err: ${item.truncationError ? formatNum(item.truncationError, 6) : 'N/A'})`,
              })),
              { label: 'Tiempo de convergencia', value: elapsedMs !== null ? `${elapsedMs.toFixed(3)} ms` : 'N/A' },
            ]}
          />
        ) : null}

        {results.length > 0 ? (
          <IterationTable
            headers={['Regla', 'Estimacion', 'Exacta', 'Error truncamiento']}
            rows={results.map((item) => [
              item.rule,
              formatNum(item.estimate, 10),
              typeof item.exact === 'number' ? formatNum(item.exact, 10) : 'N/A',
              typeof item.truncationError === 'number' ? formatNum(item.truncationError, 10) : 'N/A',
            ])}
          />
        ) : null}
      </div>
    </section>
  );
};
