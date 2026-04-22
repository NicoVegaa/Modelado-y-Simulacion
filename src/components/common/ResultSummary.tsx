interface ResultSummaryProps {
  title: string;
  values: Array<{ label: string; value: string }>;
}

export const ResultSummary = ({ title, values }: ResultSummaryProps) => {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {values.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">{item.label}</div>
            <div className="text-sm font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
