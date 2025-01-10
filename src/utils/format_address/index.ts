import { chainConfig } from '@/configs';
import { bech32 } from 'bech32';
const { prefix } = chainConfig

export function formatValAddress(address: string) {
    if (address) {
        const decode = bech32.decode(address).words;
        return bech32.encode(prefix.account, decode);
    }
    return ''
}