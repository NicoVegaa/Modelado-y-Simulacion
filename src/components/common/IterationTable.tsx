interface IterationTableProps {
  headers: string[];
  rows: (string | number)[][];
}

export const IterationTable = ({ headers, rows }: IterationTableProps) => {
  return (
    <div className="overflow-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-600">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 font-mono text-xs text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
