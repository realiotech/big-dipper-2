export function csvCell(value: string | number | null): string {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export const csvRow = (values: Array<string | number | null>) =>
  values.map(csvCell).join(',');
