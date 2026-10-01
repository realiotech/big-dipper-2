import { keccak256, rlp, toBuffer } from 'ethereumjs-util';
import { convertMsgType } from '@/utils/convert_msg_type';

export type TxTone = 'accent' | 'success' | 'evm' | 'neutral';

export type TxLabel = {
  kind: 'cosmos' | 'evm';
  name: string;
  tone: TxTone;
  extraCount: number;
  /** The Ethereum (0x) hash of an EVM transaction, which its page is keyed by. */
  evmHash?: string;
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
  // ERC20 votes / permit, access control, ownership
  '5c19a95c': 'Delegate Votes',
  c3cda520: 'Delegate Votes By Sig',
  d505accf: 'Permit',
  '2f2ff15d': 'Grant Role',
  d547741f: 'Revoke Role',
  '36568abe': 'Renounce Role',
  '8bb9c5bf': 'Renounce Role',
  f2fde38b: 'Transfer Ownership',
  '715018a6': 'Renounce Ownership',
  '79ba5097': 'Accept Ownership',
  // ERC721
  a1448194: 'Safe Mint',
  '42842e0e': 'Safe Transfer From',
  b88d4fde: 'Safe Transfer From',
  // districts-smart-contracts: DSTRX token
  d12c8e6d: 'Update Daily Mint Cap',
  // districts-smart-contracts: LandBank diamond
  '1f931c1c': 'Diamond Cut',
  fbfa9b64: 'Buy Land Pixels',
  e2226c6c: 'Mint Land Pixels',
  '07b2ec15': 'Sell Land Pixel',
  '3d5d35b0': 'Stake Land Pixel',
  '004bf8d0': 'Stake Land Pixels',
  '44e1888d': 'Unstake Land Pixel',
  '0b83a727': 'Claim All Rewards',
  '28e56163': 'Claim Reward For Token',
  '401d4482': 'Admin Withdraw',
  '68a7710a': 'Admin Withdraw Tokens',
  '7b84fda5': 'Update Fee Rate',
  faf003c0: 'Update Max District',
  '8f5f0fa1': 'Update Pixel Cost',
  '2b5fe5d0': 'Update Rebuy Delay',
  '55f804b3': 'Set Base URI',
  fca3b5aa: 'Set Minter',
  // districts-smart-contracts: LandPixel marketplace
  bd0a222b: 'List For Sale',
  bf5a4dd3: 'Unlist',
  '08a0f32f': 'Buy Now',
  '598647f8': 'Bid',
  e8083863: 'Finalize Auction',
  '4158ce0b': 'Make Offer',
  '8610f045': 'Withdraw Offer',
  '9589d7b9': 'Accept Offer',
  f4b0901f: 'Withdraw Escrow',
  '9407ea98': 'Set Marketplace Fee',
  '3a9c5712': 'Set Token Whitelisted',
  // districts-smart-contracts: UnlockDistrictVote
  b384abef: 'District Vote',
  '204973a0': 'Withdraw Vote',
  '73bc03a6': 'Withdraw After Unlock',
  12909485: 'Set Vote Threshold',
  '240b0957': 'Set Burn Percent',
  adf824c6: 'Enable Voting',
  bd46abba: 'Disable Voting',
  a57035bb: 'Set Default Vote Threshold',
  '80aba137': 'Set District Vote Threshold',
  // Realio multi-staking precompile
  '00188cf0': 'Delegate',
  '28377bbf': 'Undelegate',
  '7d272424': 'Redelegate',
  e3f07d1e: 'Cancel Unbonding',
  d05cde3b: 'Create Validator',
  // feegrant precompile
  '2cd20ce3': 'Fee Grant',
  '74a8f103': 'Revoke Fee Grant',
  // cosmos/evm staking precompile
  '53266bbb': 'Delegate',
  '3edab33c': 'Undelegate',
  '54b826f5': 'Redelegate',
  '12d58dfe': 'Cancel Unbonding',
  f7cd5516: 'Create Validator',
  a50f05ac: 'Edit Validator',
  // cosmos/evm distribution precompile
  '2efe8a5f': 'Claim Rewards',
  b46a8d61: 'Claim Reward',
  '3ce4e3be': 'Claim Commission',
  '5a9d9a96': 'Set Withdraw Address',
  '2d2b079c': 'Fund Community Pool',
  '2eb1df52': 'Deposit Validator Rewards',
  // cosmos/evm gov precompile
  a8fdc919: 'Submit Proposal',
  b24b0376: 'Deposit',
  '9ec4d363': 'Vote',
  '8f1d5f6c': 'Vote',
  a33e3086: 'Cancel Proposal',
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
    return evmMethodFromInput(`0x${data?.toString('hex') ?? ''}`);
  } catch {
    return 'Contract Call';
  }
};

/** Method name from call data ("0x42966c68…" -> "Burn"); plain value transfers have none. */
export const evmMethodFromInput = (input?: string | null): string => {
  const hex = (input ?? '').replace(/^0x/, '');
  if (!hex) return 'Transfer';
  const selector = hex.slice(0, 8).toLowerCase();
  return EVM_METHODS[selector] ?? `0x${selector}`;
};

/**
 * The 0x hash of a MsgEthereumTx, from the message itself: older messages
 * (/os.evm.v1) carry it as `hash`; current ones (/cosmos.evm.vm.v1) carry the
 * signed transaction as `raw`, whose keccak256 is the Ethereum tx hash.
 */
export const evmTxHash = (message: Record<string, any>): string | undefined => {
  if (typeof message.hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(message.hash)) return message.hash.toLowerCase();
  if (!message.raw) return undefined;
  try {
    return `0x${keccak256(toBuffer(message.raw)).toString('hex')}`;
  } catch {
    return undefined;
  }
};

/** The hash a transaction list links to and shows: 0x for EVM transactions. */
export const txListHash = (row: { hash: string; label?: TxLabel | null }) => row.label?.evmHash ?? row.hash;

export const txLabel = (messages: Array<Record<string, any>> = []): TxLabel => {
  const first = messages[0] ?? {};
  const type = shortType(first['@type']);
  const extraCount = Math.max(messages.length - 1, 0);

  if (type === ETHEREUM_TX) {
    return { kind: 'evm', name: evmMethodName(first.raw), tone: 'evm', extraCount, evmHash: evmTxHash(first) };
  }

  const [name, tone] = MSG_NAMES[type] ?? [convertMsgType([type])[0] || type, 'neutral'];
  return { kind: 'cosmos', name, tone, extraCount };
};

const FEE_DENOM = 'ario';
const FEE_DECIMALS = 18;

/** Fee paid in RIO, from a transaction's `fee` column. */
export const txFeeInRio = (fee?: { amount?: Array<{ denom: string; amount: string }> } | null): number =>
  (fee?.amount ?? [])
    .filter((coin) => coin.denom === FEE_DENOM)
    .reduce((sum, coin) => sum + Number(coin.amount) / 10 ** FEE_DECIMALS, 0);

/** The row shape the explorer's transaction lists share. */
export type TxRow = {
  hash: string;
  height: number;
  success: boolean;
  timestamp: string;
  fee: number;
  gasUsed: number;
  gasWanted: number;
  label: TxLabel;
};

export const toTxRow = (tx: {
  hash: string;
  height: any;
  success: boolean;
  fee?: any;
  gasUsed?: any;
  gasWanted?: any;
  messages?: any;
  block?: { timestamp: any } | null;
}): TxRow => ({
  hash: tx.hash,
  height: Number(tx.height),
  success: tx.success,
  timestamp: tx.block?.timestamp ?? '',
  fee: txFeeInRio(tx.fee),
  gasUsed: Number(tx.gasUsed ?? 0),
  gasWanted: Number(tx.gasWanted ?? 0),
  label: txLabel(tx.messages),
});
