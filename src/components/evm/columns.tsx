import React from "react";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import type { Column } from "@/components/explorer/data_table";
import { Tag, TxStatus } from "@/components/explorer/badges";
import { EvmAddress } from "@/components/explorer/evm_address";
import { BlockscoutAddress, formatUnits } from "@/components/explorer/blockscout";

export type TokenTransfer = {
  type: string;
  from: BlockscoutAddress;
  to: BlockscoutAddress;
  token: { symbol?: string | null; name?: string | null; decimals?: string | null; address_hash?: string; address?: string };
  total: { value?: string; decimals?: string | null; token_id?: string | null };
};

export type InternalTx = { index: number; type: string; from: BlockscoutAddress; to?: BlockscoutAddress | null; value: string; success: boolean; gas_limit?: string };
export type Log = { index: number; transaction_hash?: string; address: BlockscoutAddress; topics: Array<string | null>; data: string; decoded?: { method_call?: string } | null };
export type StateChange = { address: BlockscoutAddress; type: string; balance_before?: string | null; balance_after?: string | null; change?: string | unknown };

export const rio = (wei?: string | null) => (
  <>
    {formatUnits(wei)}{" "}
    <Text as="span" color="explorer.muted">
      RIO
    </Text>
  </>
);
export const gwei = (wei?: string | null) => formatUnits(wei, 9);

export const transferKind = (t: TokenTransfer) => {
  const zero = /^0x0+$/;
  if (zero.test(t.to?.hash ?? "")) return { label: "Burn", color: "explorer.evm" };
  if (zero.test(t.from?.hash ?? "")) return { label: "Mint", color: "explorer.successMuted" };
  return { label: "Transfer", color: "explorer.link" };
};
export const transferAmount = (t: TokenTransfer) =>
  t.total?.value !== undefined ? formatUnits(t.total.value, Number(t.total.decimals ?? t.token?.decimals ?? 18)) : `#${t.total?.token_id ?? ""}`;

export const transferColumns: Column<TokenTransfer>[] = [
  { key: "kind", header: "Type", render: (row) => { const k = transferKind(row); return <Flex><Tag color={k.color}>{k.label}</Tag></Flex>; } },
  { key: "from", header: "From", render: (row) => <EvmAddress address={row.from} short /> },
  { key: "to", header: "To", render: (row) => <EvmAddress address={row.to} short /> },
  { key: "amount", header: "Amount", align: "end", render: (row) => transferAmount(row) },
  { key: "token", header: "Token", align: "end", render: (row) => row.token?.symbol ?? row.token?.name ?? "—" },
];
export const internalColumns: Column<InternalTx>[] = [
  { key: "type", header: "Type", render: (row) => <Flex><Tag>{row.type}</Tag></Flex> },
  { key: "from", header: "From", render: (row) => <EvmAddress address={row.from} short /> },
  { key: "to", header: "To", render: (row) => <EvmAddress address={row.to} short /> },
  { key: "value", header: "Value", align: "end", render: (row) => rio(row.value) },
  { key: "status", header: "Status", align: "end", render: (row) => <Flex justify="flex-end"><TxStatus success={row.success} /></Flex> },
];
export const stateColumns: Column<StateChange>[] = [
  { key: "address", header: "Address", render: (row) => <EvmAddress address={row.address} short /> },
  { key: "type", header: "Type", render: (row) => <Flex><Tag>{row.type}</Tag></Flex> },
  { key: "before", header: "Before", align: "end", render: (row) => (row.balance_before ? rio(row.balance_before) : "—") },
  { key: "after", header: "After", align: "end", render: (row) => (row.balance_after ? rio(row.balance_after) : "—") },
];


/** Event logs as cards: emitting address, decoded call when known, topics and data. */
export const LogList = ({ logs }: { logs: { loading: boolean; items: Log[] } }) => (
  <>
    {logs.loading ? (
      <Text fontSize="sm" color="explorer.muted" py="4">Loading…</Text>
    ) : logs.items.length ? (
      <Stack gap="3">
        {logs.items.map((log) => (
          <Box key={`${log.transaction_hash ?? ""}:${log.index}`} bg="explorer.inset" borderWidth="1px" borderColor="explorer.border" borderRadius="6px" p="4" fontSize="sm">
            <Flex gap="3" mb="2" align="center" wrap="wrap">
              <Tag>Log {log.index}</Tag>
              <EvmAddress address={log.address} />
            </Flex>
            {log.decoded?.method_call && <Text color="explorer.text" mb="2">{log.decoded.method_call}</Text>}
            {log.topics.filter(Boolean).map((topic, i) => (
              <Text key={i} fontFamily="mono" fontSize="xs" color="explorer.muted" wordBreak="break-all">
                [{i}] {topic}
              </Text>
            ))}
            <Text fontFamily="mono" fontSize="xs" color="explorer.text" mt="2" wordBreak="break-all">
              {log.data}
            </Text>
          </Box>
        ))}
      </Stack>
    ) : (
      <Text py="6" textAlign="center" fontSize="sm" color="explorer.muted">No logs</Text>
    )}
  </>
);
