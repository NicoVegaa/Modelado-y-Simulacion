import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface FunctionChartProps {
  title: string;
  points: Array<{ x: number; y: number }>;
  rootPoint?: { x: number; y: number };
}

export const FunctionChart = ({ title, points, rootPoint }: FunctionChartProps) => {
  return (
    <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={points} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
          <YAxis dataKey="y" type="number" domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="y" dot={false} name="f(x)" stroke="#0ea5e9" strokeWidth={2} />
          {rootPoint ? <Scatter data={[rootPoint]} fill="#dc2626" name="Raiz aprox." /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
