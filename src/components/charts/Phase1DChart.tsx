import React from 'react';

interface Equilibrium {
  x: number;
  stability: 'estable' | 'inestable' | 'semiestable';
}

interface Phase1DChartProps {
  title: string;
  xmin: number;
  xmax: number;
  equilibria: Equilibrium[];
  directionSamples?: Array<{ x: number; sign: number }>; // sign: -1 left, +1 right
  directionSamples?: VectorPoint[];
}

export const Phase1DChart = ({ title, xmin, xmax, equilibria, directionSamples = [] }: Phase1DChartProps) => {
  const width = 600;
  const height = 120;

  const toX = (v: number) => ((v - xmin) / (xmax - xmin)) * width;

  return (
    <div className="h-40 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{title}</h3>
      <div className="overflow-auto">
        <svg width={width} height={height}>
          {/* baseline */}
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#94a3b8" strokeWidth={2} />

          {/* arrows for direction */}
          {directionSamples.map((ds, idx) => {
            const x = toX(ds.x);
            const dir = ds.sign >= 0 ? 1 : -1;
            const baseLen = 14;
            const arrowLength = baseLen * (0.4 + 0.6 * ds.magnitude); // scale 40%..100%
            const color = ds.sign >= 0 ? `rgba(14,165,233,${0.4 + 0.6 * ds.magnitude})` : `rgba(239,68,68,${0.4 + 0.6 * ds.magnitude})`;
            return (
              <g key={idx} transform={`translate(${x}, ${height / 2})`}>
                <line x1={-arrowLength * dir} y1={0} x2={arrowLength * dir} y2={0} stroke={color} strokeWidth={2} />
                <polygon
                  points={
                    dir >= 0
                      ? ` ${arrowLength},0 ${arrowLength - 6},-4 ${arrowLength - 6},4`
                      : `${-arrowLength},0 ${-arrowLength + 6},-4 ${-arrowLength + 6},4`
                  }
                  fill={color}
                />
              </g>
            );
          })}

          {/* equilibria points */}
          {equilibria.map((eq, idx) => (
            <g key={idx} transform={`translate(${toX(eq.x)}, ${height / 2})`}>
              <circle r={6} cx={0} cy={0} fill={eq.stability === 'estable' ? '#10b981' : eq.stability === 'inestable' ? '#ef4444' : '#f59e0b'} />
              <text x={10} y={-10} fontSize={12} fill="#0f172a">{eq.x.toFixed(4)}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default Phase1DChart;
