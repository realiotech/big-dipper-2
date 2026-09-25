import { rlp, toBuffer } from 'ethereumjs-util';
import { convertMsgType } from '@/utils/convert_msg_type';

export type TxTone = 'accent' | 'success' | 'evm' | 'neutral';

export type TxLabel = {
  kind: 'cosmos' | 'evm';
  name: string;
  tone: TxTone;
  extraCount: number;
};

const ETHEREUM_TX = 'MsgEthereumTx';

// Short names used across the explorer instead of the raw message type.
const MSG_NAMES: Record<string, [string, TxTone]> = {
  MsgSend: ['Send', 'accent'],
  MsgMultiSend: ['Multi Send', 'accent'],
  MsgDelegate: ['Delegate', 'success'],
  MsgUndelegate: ['Undelegate', 'success'],
  MsgBeginRedelegate: ['Redelegate', 'success'],
  MsgCancelUnbondingDelegation: ['Cancel Unbonding', 'success'],
  MsgWithdrawDelegatorReward: ['Claim Reward', 'success'],
  MsgWithdrawValidatorCommission: ['Claim Commission', 'success'],
  MsgVote: ['Vote', 'evm'],
  MsgVoteWeighted: ['Vote', 'evm'],
  MsgDeposit: ['Deposit', 'evm'],
  MsgSubmitProposal: ['Submit Proposal', 'evm'],
  MsgExec: ['Authz Exec', 'neutral'],
  MsgGrant: ['Authz Grant', 'neutral'],
  MsgRevoke: ['Authz Revoke', 'neutral'],
  MsgUpdateClient: ['IBC Update Client', 'neutral'],
  MsgAcknowledgement: ['IBC Acknowledgement', 'neutral'],
  MsgRecvPacket: ['IBC Receive', 'neutral'],
  MsgTimeout: ['IBC Timeout', 'neutral'],
  MsgTransfer: ['IBC Transfer', 'accent'],
  MsgBridgeIn: ['Bridge In', 'accent'],
  MsgBridgeOut: ['Bridge Out', 'accent'],
};

// 4-byte selectors of the contract calls seen on Realio.
const EVM_METHODS: Record<string, string> = {
  a9059cbb: 'Transfer',
  '23b872dd': 'Transfer From',
  '095ea7b3': 'Approve',
  '42966c68': 'Burn',
  '79cc6790': 'Burn From',
  '40c10f19': 'Mint',
  a22cb465: 'Set Approval For All',
  d0e30db0: 'Deposit',
  '2e1a7d4d': 'Withdraw',
};

const shortType = (type = '') => type.slice(type.lastIndexOf('.') + 1);

/**
 * Reads the method name from a signed Ethereum transaction. Legacy, EIP-2930
 * and EIP-1559 encodings keep `to` and `data` two fields apart.
 */
export const evmMethodName = (raw?: string): string => {
  try {
    const bytes = toBuffer(raw);
    const typed = bytes[0] < 0xc0;
    const fields = rlp.decode(typed ? bytes.subarray(1) : bytes) as unknown as Buffer[];
    let dataIndex = 5;
    if (typed) dataIndex = bytes[0] === 1 ? 6 : 7;
    const to = fields[dataIndex - 2];
    const data = fields[dataIndex];
    if (!to?.length) return 'Contract Create';
    if (!data?.length) return 'Transfer';
    const selector = data.subarray(0, 4).toString('hex');
    return EVM_METHODS[selector] ?? `0x${selector}`;
  } catch {
    return 'Contract Call';
  }
};

export const txLabel = (messages: Array<Record<string, any>> = []): TxLabel => {
  const first = messages[0] ?? {};
  const type = shortType(first['@type']);
  const extraCount = Math.max(messages.length - 1, 0);

  if (type === ETHEREUM_TX) {
    return { kind: 'evm', name: evmMethodName(first.raw), tone: 'evm', extraCount };
  }

  const [name, tone] = MSG_NAMES[type] ?? [convertMsgType([type])[0] || type, 'neutral'];
  return { kind: 'cosmos', name, tone, extraCount };
};
