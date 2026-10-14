import { bech32 } from 'bech32';

export type Direction = 'incoming' | 'outgoing' | 'self' | 'involved';
export type AddressRoles = { senders: string[]; recipients: string[]; participants: string[] };

const ACCOUNT = /^(?:realio|realiovaloper|osmo)1[ac-hj-np-z02-9]{20,80}$/;
const SENDERS = new Set([
  'from', 'from_address', 'sender', 'signer', 'delegator_address', 'staker',
  'staker_address', 'grantee', 'authority',
]);
const RECIPIENTS = new Set([
  'to', 'to_address', 'receiver', 'recipient', 'validator_address',
  'validator_src_address', 'validator_dst_address', 'granter',
]);

export function normalizeAddress(value: string): string | null {
  if (ACCOUNT.test(value)) return value;
  let bytes: Uint8Array | null = null;
  if (/^0x[0-9a-fA-F]{40}$/.test(value)) bytes = Uint8Array.from(Buffer.from(value.slice(2), 'hex'));
  else if (/^[A-Za-z0-9+/]{27}=$/.test(value)) {
    const decoded = Buffer.from(value, 'base64');
    if (decoded.length === 20) bytes = Uint8Array.from(decoded);
  }
  return bytes ? bech32.encode('realio', bech32.toWords(bytes)) : null;
}

/** Direction is derived from payload keys; indexer involvement is membership-only. */
export function addressRoles(value: unknown): AddressRoles {
  const senders = new Set<string>();
  const recipients = new Set<string>();
  const participants = new Set<string>();
  const add = (raw: unknown, role: 'sender' | 'recipient' | 'participant') => {
    if (typeof raw !== 'string') return;
    const address = normalizeAddress(raw);
    if (!address) return;
    participants.add(address);
    if (role === 'sender') senders.add(address);
    if (role === 'recipient') recipients.add(address);
  };
  const visit = (node: unknown, parent = ''): void => {
    if (Array.isArray(node)) return node.forEach((item) => visit(item, parent));
    if (!node || typeof node !== 'object') return;
    Object.entries(node as Record<string, unknown>).forEach(([key, child]) => {
      const k = key.toLowerCase();
      let role: 'sender' | 'recipient' | 'participant' = 'participant';
      if (SENDERS.has(k) || parent === 'inputs') role = 'sender';
      if (RECIPIENTS.has(k) || parent === 'outputs') role = 'recipient';
      if (typeof child === 'string') add(child, role);
      else visit(child, k);
    });
  };
  visit(value);
  return {
    senders: [...senders].sort(), recipients: [...recipients].sort(), participants: [...participants].sort(),
  };
}

export function directionFor(address: string, roles: AddressRoles): Direction {
  const sends = roles.senders.includes(address);
  const receives = roles.recipients.includes(address);
  if (sends && receives) return 'self';
  if (sends) return 'outgoing';
  if (receives) return 'incoming';
  return 'involved';
}

export const counterpartiesFor = (address: string, roles: AddressRoles) =>
  roles.participants.filter((candidate) => candidate !== address);

/** One side of a message: an account, or a named party with no account here (the bridge). */
export type Party = { address?: string; label?: string };
export type MessageFlow = {
  from: Party[]; to: Party[]; signer: string | null; amounts: { denom: string; amount: string }[];
};

// The account that signs a message, by the field each Cosmos message names its
// signer with; the first one present wins. MsgExec is signed by the grantee,
// grants and revocations by the granter.
const SIGNER_FIELDS = [
  'signer', 'grantee', 'from_address', 'sender', 'delegator_address', 'voter',
  'depositor', 'proposer', 'authority', 'from',
];
// Multistaking reports delegations in its internal unit, not a real token.
const INTERNAL_DENOMS = new Set(['stake']);
const BRIDGE: Party = { label: 'Bridge' };

const accountOf = (raw: unknown) => (typeof raw === 'string' ? normalizeAddress(raw) : null);
const accounts = (...raws: unknown[]): Party[] =>
  [...new Set(raws.map(accountOf).filter((address): address is string => Boolean(address)))].map((address) => ({ address }));
const coins = (raw: unknown) =>
  (Array.isArray(raw) ? raw : raw ? [raw] : [])
    .filter((coin) => coin && typeof coin.denom === 'string' && coin.amount != null && !INTERNAL_DENOMS.has(coin.denom))
    .map((coin) => ({ denom: coin.denom as string, amount: String(coin.amount) }));

/**
 * Who sent what to whom in a message, and who signed it, for reading the
 * activity feed. Staking flows are shown the way funds move: an undelegation
 * or a reward withdrawal goes from the validator to the delegator.
 */
export function messageFlow(type: string, value: unknown): MessageFlow {
  const msg = (value && typeof value === 'object' ? value : {}) as Record<string, any>;
  const kind = type.slice(type.lastIndexOf('.') + 1);
  const signerField = kind === 'MsgGrant' || kind === 'MsgRevoke' ? 'granter' : SIGNER_FIELDS.find((key) => accountOf(msg[key]));
  const signer = signerField ? accountOf(msg[signerField]) : null;
  const flow = (from: Party[], to: Party[], amounts = coins(msg.amount)): MessageFlow => ({ from, to, signer, amounts });

  switch (kind) {
    case 'MsgSend':
      return flow(accounts(msg.from_address), accounts(msg.to_address));
    case 'MsgMultiSend':
      return flow(
        accounts(...(msg.inputs ?? []).map((input: any) => input?.address)),
        accounts(...(msg.outputs ?? []).map((output: any) => output?.address)),
        (msg.inputs ?? []).flatMap((input: any) => coins(input?.coins))
      );
    case 'MsgDelegate':
      return flow(accounts(msg.delegator_address), accounts(msg.validator_address));
    case 'MsgUndelegate':
    case 'MsgCancelUnbondingDelegation':
      return flow(accounts(msg.validator_address), accounts(msg.delegator_address));
    case 'MsgBeginRedelegate':
      return flow(accounts(msg.validator_src_address), accounts(msg.validator_dst_address));
    case 'MsgWithdrawDelegatorReward':
      return flow(accounts(msg.validator_address), accounts(msg.delegator_address), []);
    case 'MsgBridgeIn':
      return flow([BRIDGE], accounts(msg.receiver), coins(msg.coin));
    case 'MsgBridgeOut':
      return flow(accounts(msg.signer), [BRIDGE], coins(msg.coin));
    case 'MsgTransfer':
      return flow(accounts(msg.sender), accountOf(msg.receiver) ? accounts(msg.receiver) : [{ label: String(msg.receiver ?? '') }], coins(msg.token));
    default: {
      const roles = addressRoles(msg);
      return flow(roles.senders.map((address) => ({ address })), roles.recipients.map((address) => ({ address })), coins(msg.amount ?? msg.coin ?? msg.token));
    }
  }
}
