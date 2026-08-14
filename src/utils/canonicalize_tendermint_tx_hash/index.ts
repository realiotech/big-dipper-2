const TENDERMINT_TX_HASH_PATTERN = /^[0-9a-fA-F]{64}$/;

/**
 * Tendermint stores and indexes transaction hashes as uppercase hexadecimal.
 * Only normalize hashes that match that exact shape so EVM hashes and invalid
 * route values keep their original casing.
 */
export const canonicalizeTendermintTxHash = (hash: string): string => {
  return TENDERMINT_TX_HASH_PATTERN.test(hash) ? hash.toUpperCase() : hash;
};
