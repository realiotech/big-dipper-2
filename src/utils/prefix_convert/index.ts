import { bech32 } from 'bech32';
import { chainConfig } from '@/configs';

const { prefix } = chainConfig;

export const toValidatorAddress = (address: string) => {
  try {
    if (!address) {
      return '';
    }
    const decode = bech32.decode(address).words;
    return bech32.encode(prefix.validator, decode);
  } catch (e) {
    console.error(e)
    return ''
  }
};

export const isValidAddress = (address: string) => {
  try {
    const decoded = bech32.decode(address).words;
    return !!decoded;
  } catch {
    return false;
  }
};
