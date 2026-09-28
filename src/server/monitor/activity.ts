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

function normalizeAddress(value: string): string | null {
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
