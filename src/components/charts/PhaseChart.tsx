import { Line, LineChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface Trajectory {
  name?: string;
  points: Array<{ x: number; y: number }>;
}

interface VectorPoint {
  x: number;
  y: number;
  dx: number;
  dy: number;
}

interface PhaseChartProps {
  title: string;
  trajectories: Trajectory[];
  vectors?: VectorPoint[];
}

export const PhaseChart = ({ title, trajectories, vectors }: PhaseChartProps) => {
  // merge first trajectory for axis scaling if any
  const baseData = trajectories.length > 0 ? trajectories[0].points : [];

  return (
    <div className="h-80 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={baseData} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={['auto', 'auto']} />
          <YAxis dataKey="y" type="number" domain={['auto', 'auto']} />
          <Tooltip />
          <Legend />
          {trajectories.map((traj, idx) => (
            <Line key={idx} data={traj.points} dataKey="y" name={traj.name ?? `traj-${idx}`} dot={false} stroke={idx === 0 ? '#0ea5e9' : '#ef4444'} strokeWidth={2} />
          ))}
          {vectors && vectors.length > 0 ? <Scatter data={vectors} fill="#0ea5e9" /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PhaseChart;
