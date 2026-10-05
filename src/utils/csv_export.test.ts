import { buildTxCsv, CsvTransaction } from '@/utils/csv_export';
import { messageTypesArg, rangeFilePart, timestampBounds, transactionWhere, TxFilters } from '@/components/explorer/tx_filters';
import { readAllPages, uniqueByHash, EXPORT_LIMIT } from '@/components/explorer/tx_export';

// Minimal RFC 4180 reader, enough to check what spreadsheets will see.
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r' && text[i + 1] === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i += 1;
    } else field += char;
  }
  row.push(field);
  rows.push(row);
  return rows;
};

const send: CsvTransaction = {
  hash: 'AAA',
  height: 19598623,
  success: true,
  fee: { amount: [{ denom: 'ario', amount: '4639000000000000' }, { denom: 'arst', amount: '12' }] },
  gasUsed: 171335,
  gasWanted: 231945,
  messages: [
    { '@type': '/cosmos.bank.v1beta1.MsgSend', from_address: 'realio1a', to_address: 'realio1b', amount: [{ denom: 'ario', amount: '1' }] },
    { '@type': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', delegator_address: 'realio1a' },
  ],
  rawLog: 'said "hi", then\nleft',
  block: { timestamp: '2026-10-05T07:12:09.123456' },
};

describe('buildTxCsv', () => {
  it('starts with a byte-order mark and the header row', () => {
    const csv = buildTxCsv([]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(parseCsv(csv.slice(1))[0]).toEqual([
      'Hash', 'EVM Hash', 'Type', 'Name', 'Status', 'Block', 'Time (UTC)', 'Fee (RIO)',
      'Gas Used/Wanted', 'Message Types', 'Message Details', 'Raw Log',
    ]);
  });

  it('keeps commas, quotes and newlines inside their fields', () => {
    const [, row] = parseCsv(buildTxCsv([send]).slice(1));
    expect(row).toHaveLength(12);
    expect(row[0]).toBe('AAA');
    expect(row[2]).toBe('Cosmos Tx');
    expect(row[3]).toBe('Send +1');
    expect(row[4]).toBe('Success');
    expect(row[5]).toBe('19598623');
    expect(row[6]).toBe('2026-10-05 07:12:09');
    expect(row[7]).toBe('0.004639 + 12arst');
    expect(row[8]).toBe('171335/231945');
    expect(row[9]).toBe('/cosmos.bank.v1beta1.MsgSend; /cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward');
    expect(row[10].split('\n')).toEqual([
      '[1] /cosmos.bank.v1beta1.MsgSend | From Address: realio1a | To Address: realio1b | Amount: [{"denom":"ario","amount":"1"}]',
      '[2] /cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward | Delegator Address: realio1a',
    ]);
    expect(row[11]).toBe('said "hi", then\nleft');
  });

  it('labels EVM transactions with their 0x hash', () => {
    const evmHash = `0x${'ab'.repeat(32)}`;
    const [, row] = parseCsv(
      buildTxCsv([{ ...send, success: false, fee: { amount: [] }, messages: [{ '@type': '/os.evm.v1.MsgEthereumTx', hash: evmHash }] }]).slice(1)
    );
    expect(row[1]).toBe(evmHash);
    expect(row[2]).toBe('Ethereum Tx');
    expect(row[4]).toBe('Failed');
    expect(row[7]).toBe('0');
  });
});

describe('transaction filters', () => {
  const range = { from: new Date('2026-09-29T00:00:00Z'), to: new Date('2026-10-05T23:59:00Z') };
  const filters: TxFilters = { source: 'cosmos', type: 'vote', range };

  it('includes the whole last minute of the range', () => {
    expect(timestampBounds(range)).toEqual({ _gte: '2026-09-29T00:00:00.000', _lt: '2026-10-06T00:00:00.000' });
  });

  it('combines range, type and source', () => {
    const where = transactionWhere(filters);
    expect(where._and).toHaveLength(3);
    expect(where._and[1]).toEqual({
      messagesByPartitionIdTransactionHash: {
        type: { _in: ['/cosmos.gov.v1.MsgVote', '/cosmos.gov.v1beta1.MsgVote', '/cosmos.gov.v1.MsgVoteWeighted', '/cosmos.gov.v1beta1.MsgVoteWeighted'] },
      },
    });
    expect(where._and[2]).toHaveProperty('_not');
    expect(transactionWhere(filters, 'all')._and).toHaveLength(2);
  });

  it('builds the messages_by_address types argument', () => {
    expect(messageTypesArg({ ...filters, type: 'send' })).toBe('{/cosmos.bank.v1beta1.MsgSend}');
    expect(messageTypesArg({ ...filters, type: null })).toBe('{}');
  });

  it('names files after the range', () => {
    expect(rangeFilePart(null)).toBe('all');
    expect(rangeFilePart({ from: new Date(2026, 8, 29), to: new Date(2026, 9, 5, 23, 59) })).toBe('2026-09-29_to_2026-10-05');
  });
});

describe('export paging', () => {
  it('stops at the first short page', async () => {
    const offsets: number[] = [];
    const rows = await readAllPages(async (offset, limit) => {
      offsets.push(offset);
      return Array.from({ length: offset < 2000 ? limit : 7 }, (_, i) => offset + i);
    });
    expect(offsets).toEqual([0, 1000, 2000]);
    expect(rows).toHaveLength(2007);
  });

  it('never reads past the export limit', async () => {
    const rows = await readAllPages(async (offset, limit) => Array.from({ length: limit }, (_, i) => offset + i));
    expect(rows).toHaveLength(EXPORT_LIMIT);
  });

  it('keeps one row per transaction', () => {
    expect(uniqueByHash([{ hash: 'a' }, { hash: 'b' }, { hash: 'a' }])).toEqual([{ hash: 'a' }, { hash: 'b' }]);
  });
});
