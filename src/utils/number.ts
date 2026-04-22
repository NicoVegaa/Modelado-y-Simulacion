export const parseNumeric = (raw: string): number => Number(raw.replace(',', '.'));

export const parseNumericList = (raw: string): number[] => {
  return raw
    .split(',')
    .map((item) => parseNumeric(item.trim()))
    .filter((item) => Number.isFinite(item));
};

export const formatNum = (value: number, digits = 8): string => {
  if (!Number.isFinite(value)) {
    return 'NaN';
  }
  return value.toFixed(digits);
};

export const confidenceToZ = (confidence: string): number => {
  switch (confidence) {
    case '90%':
      return 1.645;
    case '95%':
      return 1.96;
    case '99%':
      return 2.576;
    case '99.7%':
      return 3;
    default:
      return 1.96;
  }
};
