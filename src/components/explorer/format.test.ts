import { shortUnits } from '@/components/explorer/format';
import { formatUnits } from '@/components/explorer/blockscout';
import { txFeeWei } from '@/utils/tx_label';

describe('shortUnits', () => {
  it('rounds 18-decimal amounts to 6 places, half up', () => {
    expect(shortUnits('2965490000000000')).toBe('0.002965');
    expect(shortUnits('907955000000000')).toBe('0.000908');
    expect(shortUnits('4639000000000000')).toBe('0.004639');
  });

  it('never shows a non-zero amount as 0', () => {
    expect(shortUnits('3710588')).toBe('<0.000001');
    expect(shortUnits('0')).toBe('0');
    expect(shortUnits('')).toBe('0');
  });

  it('keeps large amounts exact and grouped', () => {
    expect(shortUnits('1234567891234567890123456')).toBe('1,234,567.891235');
    expect(shortUnits('300243000000000000')).toBe('0.300243');
  });
});

describe('txFeeWei', () => {
  it('sums ario coins exactly, past the range of a JS number', () => {
    const fee = { amount: [{ denom: 'ario', amount: '300243000000000001' }, { denom: 'ario', amount: '2' }, { denom: 'arst', amount: '5' }] };
    expect(txFeeWei(fee)).toBe('300243000000000003');
    expect(formatUnits(txFeeWei(fee))).toBe('0.300243000000000003');
  });

  it('is 0 without a fee', () => {
    expect(txFeeWei(null)).toBe('0');
    expect(txFeeWei({ amount: [] })).toBe('0');
  });
});
