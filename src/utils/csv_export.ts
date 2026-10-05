import Big from 'big.js';
import { txLabel } from '@/utils/tx_label';

/**
 * Transaction CSV export, shared by the transactions page and account pages.
 */

/** The transaction fields an export reads. */
export type CsvTransaction = {
  hash: string;
  height: any;
  success: boolean;
  fee?: any;
  gasUsed?: any;
  gasWanted?: any;
  messages?: any;
  rawLog?: string | null;
  block?: { timestamp: any } | null;
};

const FEE_DENOM = 'ario';
const FEE_DECIMALS = 18;

const HEADERS = [
  'Hash',
  'EVM Hash',
  'Type',
  'Name',
  'Status',
  'Block',
  'Time (UTC)',
  'Fee (RIO)',
  'Gas Used/Wanted',
  'Message Types',
  'Message Details',
  'Raw Log',
];

const escapeField = (field: unknown): string => {
  if (field === null || field === undefined) return '';
  const value = String(field);
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
};

/** "2025-11-05T08:00:04.805117" (UTC, no zone) -> "2025-11-05 08:00:04". */
const formatTime = (timestamp?: string | null) => (timestamp ? String(timestamp).replace('T', ' ').slice(0, 19) : '');

/** Fee in RIO, exact; any other denoms are appended in base units. */
const formatFee = (fee: any): string => {
  const coins: Array<{ denom: string; amount: string }> = fee?.amount ?? [];
  const rio = coins
    .filter((coin) => coin.denom === FEE_DENOM)
    .reduce((sum, coin) => sum.plus(Big(coin.amount || '0')), Big(0))
    .div(Big(10).pow(FEE_DECIMALS));
  const others = coins.filter((coin) => coin.denom !== FEE_DENOM).map((coin) => `${coin.amount}${coin.denom}`);
  return [rio.toFixed(), ...others].join(' + ');
};

const parseMessages = (messages: any): Array<Record<string, any>> =>
  (Array.isArray(messages) ? messages : []).map((msg) => {
    if (typeof msg !== 'string') return msg ?? {};
    try {
      return JSON.parse(msg);
    } catch {
      return { '@type': msg };
    }
  });

const formatMessageTypes = (messages: Array<Record<string, any>>) => messages.map((msg) => msg['@type'] || 'Unknown').join('; ');

/** One line per message: "[1] /cosmos.bank.v1beta1.MsgSend | From Address: … | Amount: […]". */
const formatMessageDetails = (messages: Array<Record<string, any>>) =>
  messages
    .map((msg, index) => {
      const details = Object.entries(msg)
        .filter(([key]) => key !== '@type')
        .map(([key, value]) => {
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
          return `${label}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;
        })
        .join(' | ');
      return `[${index + 1}] ${msg['@type'] || 'Unknown'}${details ? ` | ${details}` : ''}`;
    })
    .join('\n');

const toRow = (tx: CsvTransaction): unknown[] => {
  const messages = parseMessages(tx.messages);
  const label = txLabel(messages);
  return [
    tx.hash,
    label.evmHash ?? '',
    label.kind === 'evm' ? 'Ethereum Tx' : 'Cosmos Tx',
    label.extraCount > 0 ? `${label.name} +${label.extraCount}` : label.name,
    tx.success ? 'Success' : 'Failed',
    tx.height,
    formatTime(tx.block?.timestamp),
    formatFee(tx.fee),
    `${tx.gasUsed ?? 0}/${tx.gasWanted ?? 0}`,
    formatMessageTypes(messages),
    formatMessageDetails(messages),
    tx.rawLog ?? '',
  ];
};

/** CSV text for the given transactions, with a byte-order mark so Excel reads it as UTF-8. */
export const buildTxCsv = (transactions: CsvTransaction[]): string =>
  `\uFEFF${[HEADERS, ...transactions.map(toRow)].map((row) => row.map(escapeField).join(',')).join('\r\n')}`;

/** Saves text as a file through a temporary link. */
export const downloadCsv = (content: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 100);
};
