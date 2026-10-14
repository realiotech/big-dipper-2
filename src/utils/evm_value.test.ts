import { decodeApprove, valueLines } from '@/utils/evm_value';
import type { CosmosActivity } from '@/utils/cosmos_activity';

const VAL = 'realiovaloper105pcxx692pmf32zh97zyxhkhrtd08xdwmlcrkr';
const rewards: CosmosActivity = { kind: 'rewards', coins: [{ denom: 'ario', amount: '17662570188619164334' }], validators: [VAL, VAL, VAL] };
const delegate: CosmosActivity = { kind: 'delegate', validator: VAL, coins: [{ denom: 'erc20:0xb841', amount: '82148977098251990171' }] };

const SPENDER = '4495bba7e8a9f1600e64f9c994d75ae4d95086a3';
const approveInput = (amountHex: string) => `0x095ea7b3${'0'.repeat(24)}${SPENDER}${amountHex.padStart(64, '0')}`;

describe('valueLines', () => {
  it('shows a plain native transfer as its value', () => {
    expect(valueLines({ value: '1000000000000000000000000', input: '0x', activity: [], transfers: [] })).toEqual([
      { type: 'native', tag: 'Transfer', wei: '1000000000000000000000000' },
    ]);
  });

  it('calls native value sent with a contract call a payment, before what it bought', () => {
    expect(valueLines({ value: '5000000000000000000000', input: '0xe2226c6c00', activity: [], transfers: [{ kind: 'Mint' }] })).toEqual([
      { type: 'native', tag: 'Payment', wei: '5000000000000000000000' },
      { type: 'token', tag: 'Minted', index: 0 },
    ]);
  });

  it('drops a 0 native value when something else moved', () => {
    expect(valueLines({ value: '0', input: '0x2efe8a5f', activity: [rewards], transfers: [] })).toEqual([
      { type: 'cosmos', tag: 'Claim reward', activity: rewards },
    ]);
  });

  it('lists the staking action first and its automatic reward payout last', () => {
    const transfers = [{ kind: 'Transfer' as const, amount: '82148977098251990171' }, { kind: 'Transfer' as const, amount: '7' }];
    expect(valueLines({ value: '0', input: '0x00188cf0', activity: [rewards, delegate], transfers })).toEqual([
      { type: 'cosmos', tag: 'Delegate', activity: delegate },
      // index 0 is the delegated DSTRX moving into staking, already on the Delegate line
      { type: 'token', tag: 'Transfer', index: 1 },
      { type: 'cosmos', tag: 'Auto-claimed', activity: rewards },
    ]);
  });

  it('tags token mints, burns and transfers', () => {
    expect(valueLines({ value: '0', input: '0x42966c68', activity: [], transfers: [{ kind: 'Burn' }, { kind: 'Transfer' }] }).map((line) => line.tag)).toEqual(['Burnt', 'Transfer']);
  });

  it('reads approvals from call data', () => {
    expect(valueLines({ value: '0', input: approveInput('de0b6b3a7640000'), activity: [], transfers: [] })).toEqual([
      { type: 'approval', tag: 'Approval', spender: `0x${SPENDER}`, amount: '1000000000000000000' },
    ]);
  });

  it('is empty when nothing moved, so the row shows 0 RIO', () => {
    expect(valueLines({ value: '0', input: '0xa9059cbb', activity: [], transfers: [] })).toEqual([]);
    expect(valueLines({ value: null, input: null, activity: [], transfers: [] })).toEqual([]);
  });
});

describe('decodeApprove', () => {
  it('decodes unlimited allowances and ignores other calls', () => {
    expect(decodeApprove(approveInput('f'.repeat(64)))?.amount).toBe(
      '115792089237316195423570985008687907853269984665640564039457584007913129639935'
    );
    expect(decodeApprove('0xa9059cbb')).toBeNull();
    expect(decodeApprove('0x095ea7b3')).toBeNull();
  });
});
