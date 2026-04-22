export const toCsv = (headers: string[], rows: (string | number)[][]): string => {
  const headerLine = headers.join(',');
  const rowLines = rows.map((row) => row.join(','));
  return [headerLine, ...rowLines].join('\n');
};

export const copyText = async (value: string): Promise<void> => {
  await navigator.clipboard.writeText(value);
};
