type DenomMeta = { symbol: string; exponent: number };

const DENOMS: Record<string, DenomMeta> = {
  ario: { symbol: 'RIO', exponent: 18 },
  arst: { symbol: 'RST', exponent: 18 },
  almx: { symbol: 'ALMX', exponent: 18 },
};

// Bridged denominations carry no registry entry, so their precision comes from
// the denom prefix: ERC-20 wrappers keep 18 decimals, IBC vouchers use 6.
const PREFIX_EXPONENTS: { prefix: string; exponent: number }[] = [
  { prefix: 'erc20:', exponent: 18 },
  { prefix: 'ibc/', exponent: 6 },
];

export function denomMeta(denom: string): DenomMeta | null {
  const known = DENOMS[denom];
  if (known) return known;
  const match = PREFIX_EXPONENTS.find((item) => denom.startsWith(item.prefix));
  return match ? { symbol: denom, exponent: match.exponent } : null;
}

export const denomSymbol = (denom: string) => denomMeta(denom)?.symbol ?? denom;

export function formatBaseUnits(
  amount: string,
  denom: string,
  fractionDigits = 2,
  includeSymbol = true
): string {
  const meta = denomMeta(denom);
  if (!meta) return includeSymbol ? `${amount} ${denom}` : amount;
  const negative = amount.startsWith('-');
  const digits = (negative ? amount.slice(1) : amount).replace(/^0+(?=\d)/, '') || '0';
  const padded = digits.padStart(meta.exponent + 1, '0');
  const whole = padded.slice(0, -meta.exponent) || '0';
  const fraction = padded.slice(-meta.exponent).slice(0, fractionDigits).replace(/0+$/, '');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const value = `${negative ? '-' : ''}${grouped}${fraction ? `.${fraction}` : ''}`;
  return includeSymbol ? `${value} ${meta.symbol}` : value;
}

export const short = (value: string, edge = 8) =>
  value.length > edge * 2 + 1 ? `${value.slice(0, edge)}…${value.slice(-edge)}` : value;

export const messageLabel = (type: string) => type.split('.').pop()?.replace(/^Msg/, '') ?? type;
