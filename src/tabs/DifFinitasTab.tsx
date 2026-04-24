import { useMemo, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FieldHint } from '../components/common/FieldHint';
import { IterationTable } from '../components/common/IterationTable';
import { MethodFormulaInfo } from '../components/common/MethodFormulaInfo';
import { finiteDifferenceExamples } from '../data/examples';
import { runFiniteDifferences } from '../utils/algorithms/finiteDifferences';
import { copyText, toCsv } from '../utils/csv';
import { formatNum, parseNumeric, parseNumericList } from '../utils/number';
import type { FiniteDifferenceRecord } from '../types/numerical';

export const DifFinitasTab = () => {
  const [mode, setMode] = useState<'funcion' | 'tabla'>('funcion');
  const [expression, setExpression] = useState('sin(x)');
  const [xList, setXList] = useState('0,0.5,1,1.5,2');
  const [yList, setYList] = useState('');
  const [h, setH] = useState('0.5');
  const [order, setOrder] = useState<'1' | '2'>('1');
  const [method, setMethod] = useState<'progresiva' | 'regresiva' | 'central'>('central');
  const [records, setRecords] = useState<FiniteDifferenceRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const applyExample = (index: string) => {
    if (!index) {
      return;
    }
    const selected = finiteDifferenceExamples[Number(index)]?.value;
    if (!selected) {
      return;
    }
    setMode(selected.expression ? 'funcion' : 'tabla');
    setExpression(selected.expression ?? '');
    setXList(selected.xList);
    setYList(selected.yList ?? '');
    setH(String(selected.h));
    setOrder(String(selected.order) as '1' | '2');
    setMethod(selected.method);
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const startTime = performance.now();
      const xValues = parseNumericList(xList);
      const yValues = mode === 'tabla' ? parseNumericList(yList) : undefined;
      const output = runFiniteDifferences({
        xValues,
        yValues,
        expression: mode === 'funcion' ? expression : undefined,
        h: parseNumeric(h),
        order: Number(order) as 1 | 2,
        method,
      });
      const durationMs = performance.now() - startTime;
      setRecords(output);
      setMessage('Derivadas calculadas correctamente.');
      setElapsedMs(durationMs);
    } catch (err) {
      setRecords([]);
      setElapsedMs(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular.');
    }
  };

  const chartData = useMemo(() => records.map((item) => ({ x: item.x, fx: item.fx, dfx: item.derivativeApprox })), [records]);

  const handleClear = () => {
    setMode('funcion');
    setExpression('sin(x)');
    setXList('0,0.5,1,1.5,2');
    setYList('');
    setH('0.5');
    setOrder('1');
    setMethod('central');
    setRecords([]);
    setElapsedMs(null);
    setError(null);
    setMessage(null);
  };

  const copyResults = async () => {
    if (records.length === 0) {
      setError('No hay resultados para copiar.');
      return;
    }
    await copyText(
      toCsv(
        ['x_i', 'f(x_i)', 'derivada aprox', 'derivada exacta', 'error abs'],
        records.map((item) => [item.x, item.fx, item.derivativeApprox, item.derivativeExact ?? '', item.absoluteError ?? ''])
      )
    );
    setMessage('Tabla copiada en CSV.');
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(320px,450px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Diferencias Finitas</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(event) => applyExample(event.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {finiteDifferenceExamples.map((example, index) => (
              <option key={example.label} value={index}>
                {example.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Modo
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={mode} onChange={(event) => setMode(event.target.value as 'funcion' | 'tabla')}>
            <option value="funcion">Funcion f(x)</option>
            <option value="tabla">Tabla (x_i, f_i)</option>
          </select>
        </label>

        {mode === 'funcion' ? (
          <label className="block text-sm font-medium text-slate-700">
            f(x)
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={expression} onChange={(event) => setExpression(event.target.value)} />
            <FieldHint text="si se define f(x), se calcula derivada exacta y error" />
          </label>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          Lista de x
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={xList} onChange={(event) => setXList(event.target.value)} />
          <FieldHint text="separar por comas, ejemplo: 0,1,2,3" />
        </label>

        {mode === 'tabla' ? (
          <label className="block text-sm font-medium text-slate-700">
            Lista de f(x)
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={yList} onChange={(event) => setYList(event.target.value)} />
            <FieldHint text="misma cantidad de valores que la lista de x" />
          </label>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          <label className="block text-sm font-medium text-slate-700">
            h
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={h} onChange={(event) => setH(event.target.value)} />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Orden
            <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={order} onChange={(event) => setOrder(event.target.value as '1' | '2')}>
              <option value="1">Primera</option>
              <option value="2">Segunda</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Metodo
            <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={method} onChange={(event) => setMethod(event.target.value as 'progresiva' | 'regresiva' | 'central')}>
              <option value="progresiva">Progresiva</option>
              <option value="regresiva">Regresiva</option>
              <option value="central">Central</option>
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
          <button className="rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900" type="button" onClick={copyResults}>
            Copiar resultados
          </button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
        {elapsedMs !== null ? <p className="rounded-md bg-sky-50 p-2 text-sm text-sky-700">Tiempo de convergencia: {elapsedMs.toFixed(3)} ms.</p> : null}
      </div>

      <div className="space-y-4">
        <MethodFormulaInfo method="dif-finitas" />

        <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-3 text-base font-semibold text-slate-900">f(x) y derivada aproximada</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="fx" name="f(x)" stroke="#0284c7" />
              <Line dataKey="dfx" name="f'(x) aprox" stroke="#ea580c" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {records.length > 0 ? (
          <IterationTable
            headers={['x_i', 'f(x_i)', 'f derivada aprox', 'f derivada exacta', 'error abs']}
            rows={records.map((item) => [
              formatNum(item.x),
              formatNum(item.fx),
              formatNum(item.derivativeApprox),
              item.derivativeExact ? formatNum(item.derivativeExact) : 'N/A',
              item.absoluteError ? formatNum(item.absoluteError) : 'N/A',
            ])}
          />
        ) : null}
      </div>
    </section>
  );
};
