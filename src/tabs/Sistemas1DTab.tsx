import { useState } from 'react';
import { FieldHint } from '../components/common/FieldHint';
import { FunctionChart } from '../components/charts/FunctionChart';
import Phase1DChart from '../components/charts/Phase1DChart';
import { evaluateExpression } from '../utils/mathParser';
import { runBisection } from '../utils/algorithms/bisection';
import { runEDO } from '../utils/algorithms/edo';
import { IterationTable } from '../components/common/IterationTable';
import { copyText, toCsv } from '../utils/csv';
import { sistemas1DExamples } from '../data/examples';

const numericDerivative = (expr: string, x: number, h = 1e-6) => {
  const f1 = evaluateExpression(expr, x + h);
  const f2 = evaluateExpression(expr, x - h);
  return (f1 - f2) / (2 * h);
};

const findEquilibria = (expr: string, xmin: number, xmax: number, samples = 200, tol = 1e-8) => {
  const xs: number[] = [];
  const dx = (xmax - xmin) / samples;
  let prevX = xmin;
  let prevVal = evaluateExpression(expr, prevX);

  for (let i = 1; i <= samples; i++) {
    const x = xmin + i * dx;
    let val: number;
    try {
      val = evaluateExpression(expr, x);
    } catch {
      continue;
    }

    if (prevVal === 0) {
      xs.push(prevX);
    }

    if (prevVal * val < 0) {
      // try bisection between prevX and x
      try {
        const res = runBisection({ expression: expr, a: prevX, b: x, tolerance: tol, maxIterations: 100 });
        xs.push(res.root);
      } catch {
        // ignore
      }
    }

    prevX = x;
    prevVal = val;
  }

  // unique
  return Array.from(new Set(xs.map((v) => Number(v.toFixed(8))))).map((v) => Number(v));
};

export const Sistemas1DTab = () => {
  const [fexpr, setFexpr] = useState('2*x');
  const [xmin, setXmin] = useState('-5');
  const [xmax, setXmax] = useState('5');
  const [samples, setSamples] = useState('200');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [equilibria, setEquilibria] = useState<Array<{ x: number; stability: string }>>([]);
  const [directionSamples, setDirectionSamples] = useState<Array<{ x: number; sign: number; magnitude: number }>>([]);
  const [trajectories, setTrajectories] = useState<Array<{ label: string; points: Array<{ x: number; y: number }> }>>([]);

  const handleExampleChange = (index: string) => {
    if (!index) return;
    const sel = sistemas1DExamples[Number(index)]?.value;
    if (!sel) return;
    setFexpr(sel.expression);
    setXmin(String(sel.xmin));
    setXmax(String(sel.xmax));
    setSamples(String(sel.samples ?? 200));
    setError(null);
    setMessage(null);
  };

  const handleAnalyze = () => {
    setError(null);
    setMessage(null);

    const xminV = Number(xmin.replace(',', '.'));
    const xmaxV = Number(xmax.replace(',', '.'));
    const samplesV = Number(samples);

    if (!fexpr.trim()) {
      setError('Ingrese f(x).');
      return;
    }
    if ([xminV, xmaxV, samplesV].some((v) => Number.isNaN(v))) {
      setError('Campos numericos invalidos.');
      return;
    }
    if (xminV >= xmaxV) {
      setError('xmin debe ser menor que xmax.');
      return;
    }

    try {
      const eqs = findEquilibria(fexpr, xminV, xmaxV, samplesV);
      const eqsWithStability = eqs.map((x) => {
        const deriv = numericDerivative(fexpr, x);
        const stability = deriv < 0 ? 'estable' : deriv > 0 ? 'inestable' : 'semiestable';
        return { x, stability };
      });

      // build direction samples with normalized magnitude
      const N = Math.min(samplesV, 300);
      const raw: Array<{ x: number; val: number }> = [];
      const dx = (xmaxV - xminV) / N;
      for (let i = 0; i <= N; i++) {
        const x = xminV + i * dx;
        let val = 0;
        try {
          val = evaluateExpression(fexpr, x);
        } catch {
          val = 0;
        }
        raw.push({ x, val });
      }

      const maxAbs = Math.max(...raw.map((r) => Math.abs(r.val), 0), 0.000001);
      const dirSamples = raw.map((r) => ({ x: r.x, sign: Math.sign(r.val) || 1, magnitude: Math.min(1, Math.abs(r.val) / maxAbs) }));

      setEquilibria(eqsWithStability as any);
      setDirectionSamples(dirSamples);
      setTrajectories([]);
      setMessage('Analisis completado.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar.');
    }
  };

  const handleSimulate = async () => {
    setError(null);
    setMessage(null);

    // ask for a few initial conditions around equilibria
    const xminV = Number(xmin.replace(',', '.'));
    const xmaxV = Number(xmax.replace(',', '.'));

    const initials = [xminV + (xmaxV - xminV) * 0.1, xminV + (xmaxV - xminV) * 0.3, xminV + (xmaxV - xminV) * 0.7];
    const newTrajs: Array<{ label: string; points: Array<{ x: number; y: number }> }> = [];

    for (let ic of initials) {
      // prepare expression for solver replacing variable x with y
      const solverExpr = fexpr.replace(/\bx\b/g, 'y');
      try {
        const res: any = runEDO({ expression: solverExpr, t0: 0, y0: ic, tf: 10, h: 0.05, method: 'rk4' });
        const points = res.iterations.map((it: any) => ({ x: it.t, y: it.y }));
        newTrajs.push({ label: `IC=${ic.toFixed(3)}`, points });
      } catch (e) {
        // ignore
      }
    }

    setTrajectories(newTrajs as any);
    setMessage('Simulacion completada.');
  };

  const handleCopyEquilibria = async () => {
    if (equilibria.length === 0) {
      setError('No hay equilibrios para copiar.');
      return;
    }
    try {
      const csv = toCsv(['x', 'stability'], equilibria.map((e) => [e.x, e.stability]));
      await copyText(csv);
      setMessage('Equilibrios copiados al portapapeles.');
    } catch {
      setError('No se pudo copiar.');
    }
  };

  const functionPoints = (() => {
    const xminV = Number(xmin.replace(',', '.'));
    const xmaxV = Number(xmax.replace(',', '.'));
    const pts: Array<{ x: number; y: number }> = [];
    const n = 200;
    const dx = (xmaxV - xminV) / n;
    for (let i = 0; i <= n; i++) {
      const x = xminV + i * dx;
      let y = 0;
      try {
        y = evaluateExpression(fexpr, x);
      } catch {
        y = NaN;
      }
      pts.push({ x, y });
    }
    return pts;
  })();

  const rows = equilibria.map((e, idx) => [idx + 1, e.x.toFixed(8), e.stability]);

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Sistemas Autónomos 1D</h2>

        <label className="block text-sm font-medium text-slate-700">
          Ejemplos
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="" onChange={(e) => handleExampleChange(e.target.value)}>
            <option value="">Seleccionar ejemplo</option>
            {sistemas1DExamples.map((ex, idx) => (
              <option key={ex.label} value={idx}>
                {ex.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-medium text-slate-700">
          f(x)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={fexpr} onChange={(e) => setFexpr(e.target.value)} />
          <FieldHint text="Variable independiente: x. Ej: x*(100-x)" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-slate-700">
            xmin
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={xmin} onChange={(e) => setXmin(e.target.value)} />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            xmax
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={xmax} onChange={(e) => setXmax(e.target.value)} />
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-700">
          Muestras (para detección y flechas)
          <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={samples} onChange={(e) => setSamples(e.target.value)} />
        </label>

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="button" onClick={handleAnalyze} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white">Analizar</button>
          <button type="button" onClick={handleSimulate} className="rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-900">Simular trayectorias</button>
          <button type="button" onClick={handleCopyEquilibria} className="rounded-md bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-900">Copiar equilibrios</button>
        </div>

        {error ? <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
      </div>

      <div className="space-y-4">
        <FunctionChart title="f(x)" points={functionPoints.filter((p) => Number.isFinite(p.y))} />

        <Phase1DChart title="Diagrama de fases 1D" xmin={Number(xmin)} xmax={Number(xmax)} equilibria={equilibria} directionSamples={directionSamples} />

        {trajectories.map((traj) => (
          <div key={traj.label}>
            <h4 className="text-sm font-medium text-slate-800">{traj.label}</h4>
            <FunctionChart title={`Trayectoria ${traj.label} (t vs x)`} points={traj.points.map((p) => ({ x: p.x, y: p.y }))} />
          </div>
        ))}

        {rows.length > 0 ? <IterationTable headers={[ 'n', 'x*', 'estabilidad' ]} rows={rows} /> : null}
      </div>
    </section>
  );
};

export default Sistemas1DTab;
