import React, { useState } from "react";
import { Box, Flex, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import { useEvmTransactionQuery } from "@/graphql/types/general_types";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { evmMethodFromInput, TxLabel } from "@/utils/tx_label";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DetailRows } from "@/components/explorer/detail_rows";
import { DataTable } from "@/components/explorer/data_table";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { CursorPager } from "@/components/explorer/cursor_pager";
import { CodeBlock } from "@/components/explorer/code_block";
import { CopyButton } from "@/components/explorer/copy_button";
import { Tag, TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { EvmAddress } from "@/components/explorer/evm_address";
import { formatUtc, timeAgo } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { BlockscoutAddress, useBlockscout, useBlockscoutList } from "@/components/explorer/blockscout";
import {
  InternalTx,
  internalColumns,
  Log,
  LogList,
  rio,
  gwei,
  StateChange,
  stateColumns,
  TokenTransfer,
  transferAmount,
  transferColumns,
  transferKind,
} from "@/components/evm/columns";

type EvmTx = {
  hash: string;
  status: string;
  result: string;
  revert_reason?: unknown;
  block_number: number;
  confirmations: number;
  timestamp: string;
  from: BlockscoutAddress;
  to?: BlockscoutAddress | null;
  created_contract?: BlockscoutAddress | null;
  value: string;
  fee?: { value: string };
  gas_used: string;
  gas_limit: string;
  gas_price?: string | null;
  base_fee_per_gas?: string | null;
  max_fee_per_gas?: string | null;
  max_priority_fee_per_gas?: string | null;
  transaction_burnt_fee?: string | null;
  raw_input?: string;
  method?: string | null;
  decoded_input?: { method_call?: string } | null;
  token_transfers?: TokenTransfer[] | null;
  nonce: number;
  position: number;
  type?: number;
};

const PanelTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box mb="4">
    <Text fontSize="md" fontWeight="600" color="explorer.text">
      {title}
    </Text>
    {subtitle && (
      <Text fontSize="sm" color="explorer.muted">
        {subtitle}
      </Text>
    )}
  </Box>
);

export default function EvmTransactionDetails() {
  const router = useRouter();
  const hash = String(router.query.tx ?? "");
  const valid = /^0x[0-9a-fA-F]{64}$/.test(hash);
  const [tab, setTab] = useState("details");
  const { data: tx, loading, notFound } = useBlockscout<EvmTx>(valid ? `transactions/${hash}` : null);
  const { data: mapping } = useEvmTransactionQuery({ variables: { ehash: hash.toLowerCase() }, skip: !valid });
  const cosmosHash = mapping?.etransaction?.[0]?.transaction_hash;

  const base = valid && tab !== "details" ? `transactions/${hash}` : null;
  const transfers = useBlockscoutList<TokenTransfer>(tab === "transfers" ? `${base}/token-transfers` : null);
  const internal = useBlockscoutList<InternalTx>(tab === "internal" ? `${base}/internal-transactions` : null);
  const logs = useBlockscoutList<Log>(tab === "logs" ? `${base}/logs` : null);
  const state = useBlockscoutList<StateChange>(tab === "state" ? `${base}/state-changes` : null);
  const { data: trace, loading: traceLoading } = useBlockscout<unknown>(tab === "trace" ? `${base}/raw-trace` : null);

  if (!valid || notFound) return <NotFound />;

  const method = tx ? tx.decoded_input?.method_call?.split("(")[0] || evmMethodFromInput(tx.raw_input) : "";
  const label: TxLabel = { kind: "evm", name: method, tone: "evm", extraCount: 0 };
  const selector = tx?.raw_input && tx.raw_input.length >= 10 ? tx.raw_input.slice(0, 10) : "";
  const gasRatio = tx ? (Number(tx.gas_used) / Math.max(Number(tx.gas_limit), 1)) * 100 : 0;
  const crumbs = [{ label: "Transactions", href: "/transactions" }, { label: "Details" }];

  const pagerFor = (list: ReturnType<typeof useBlockscoutList>) => (
    <Flex justify="flex-end" mt="3">
      <CursorPager page={list.page} hasPrevious={list.hasPrevious} hasNext={list.hasNext} onPrevious={list.previous} onNext={list.next} />
    </Flex>
  );

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={crumbs}
        title={
          <Flex as="span" align="center" gap="3" wrap="wrap">
            Transaction
            <TxTypeTag kind="evm" />
            {method && <TxNameTag label={label} />}
          </Flex>
        }
        subtitle={
          <Flex as="span" align="center" gap="1">
            <Text as="span" color="explorer.link" wordBreak="break-all">
              {hash}
            </Text>
            <CopyButton value={hash} label="Copy transaction hash" />
          </Flex>
        }
      />

      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "details", label: "Details" },
            { value: "transfers", label: "Token transfers" },
            { value: "internal", label: "Internal txns" },
            { value: "logs", label: "Logs" },
            { value: "state", label: "State" },
            { value: "trace", label: "Raw trace" },
          ]}
        >
          <TabPanel value="details" pt="2">
            <DetailRows
              loading={loading}
              rows={[
                { label: "Transaction hash", value: <Flex align="center" gap="1"><Text color="explorer.link">{hash}</Text><CopyButton value={hash} /></Flex> },
                { label: "Status", value: tx ? <TxStatus success={tx.status === "ok"} /> : "" },
                ...(tx && tx.status !== "ok" ? [{ label: "Error", value: <Text color="explorer.danger">{tx.result}</Text> }] : []),
                {
                  label: "Type",
                  value: (
                    <Flex align="center" gap="2" wrap="wrap">
                      <TxTypeTag kind="evm" />
                      {method && <TxNameTag label={label} />}
                      {selector && selector !== method && <Text color="explorer.muted" fontSize="xs">{selector}</Text>}
                    </Flex>
                  ),
                },
                {
                  label: "Block",
                  value: tx && (
                    <Flex gap="3" align="center">
                      <ChakraLink asChild color="explorer.link">
                        <NextLink href={BLOCK_DETAILS(tx.block_number)}>{numeral(tx.block_number).format("0,0")}</NextLink>
                      </ChakraLink>
                      <Text color="explorer.muted">{numeral(tx.confirmations).format("0,0")} block confirmations</Text>
                    </Flex>
                  ),
                },
                ...(cosmosHash
                  ? [{
                      label: "Cosmos transaction",
                      value: (
                        <ChakraLink asChild color="explorer.link" wordBreak="break-all">
                          <NextLink href={TRANSACTION_DETAILS(cosmosHash)}>{cosmosHash}</NextLink>
                        </ChakraLink>
                      ),
                    }]
                  : []),
                { label: "Timestamp", value: tx && <Text>{formatUtc(tx.timestamp)} <Text as="span" color="explorer.muted">{timeAgo(tx.timestamp)}</Text></Text> },
                { label: "From", value: <EvmAddress address={tx?.from} /> },
                tx?.created_contract
                  ? { label: "Contract created", value: <EvmAddress address={tx.created_contract} /> }
                  : { label: "Interacted with", value: <EvmAddress address={tx?.to} /> },
                { label: "Value", value: rio(tx?.value) },
                { label: "Transaction fee", value: rio(tx?.fee?.value) },
              ]}
            />
          </TabPanel>
          <TabPanel value="transfers" pt="0">
            <DataTable columns={transferColumns} rows={transfers.items} rowKey={(row) => `${row.from?.hash}:${row.to?.hash}:${transferAmount(row)}`} loading={transfers.loading} skeletonRows={4} emptyText="No token transfers" />
            {pagerFor(transfers)}
          </TabPanel>
          <TabPanel value="internal" pt="0">
            <DataTable columns={internalColumns} rows={internal.items} rowKey={(row) => row.index} loading={internal.loading} skeletonRows={4} emptyText="No internal transactions" />
            {pagerFor(internal)}
          </TabPanel>
          <TabPanel value="logs" pt="2">
            <LogList logs={logs} />
            {pagerFor(logs)}
          </TabPanel>
          <TabPanel value="state" pt="0">
            <DataTable columns={stateColumns} rows={state.items} rowKey={(row) => `${row.address?.hash}:${row.type}`} loading={state.loading} skeletonRows={4} emptyText="No state changes" />
            {pagerFor(state)}
          </TabPanel>
          <TabPanel value="trace" pt="2">
            {traceLoading ? <Text fontSize="sm" color="explorer.muted" py="4">Loading…</Text> : <CodeBlock label="raw trace" value={trace ?? []} />}
          </TabPanel>
        </ExplorerTabs>
      </Panel>

      {tab === "details" && tx && (tx.token_transfers?.length ?? 0) > 0 && (
        <Panel>
          <PanelTitle title="Token transfers" subtitle="Token transfer events emitted while executing this transaction." />
          <Stack gap="2">
            {tx.token_transfers!.map((t, i) => {
              const kind = transferKind(t);
              return (
                <Flex key={i} align="center" gap="3" wrap="wrap" bg="explorer.inset" borderWidth="1px" borderColor="explorer.border" borderRadius="6px" px="4" py="3" fontSize="sm">
                  <Tag color={kind.color}>{kind.label}</Tag>
                  <Text color="explorer.muted">From</Text>
                  <EvmAddress address={t.from} short />
                  <Text color="explorer.muted">to</Text>
                  <EvmAddress address={t.to} short />
                  <Text color="explorer.muted" ml="auto">For</Text>
                  <Text color="explorer.text">{transferAmount(t)}</Text>
                  <Text color="explorer.text">{t.token?.symbol ?? ""}</Text>
                </Flex>
              );
            })}
          </Stack>
        </Panel>
      )}

      {tab === "details" && tx && (
        <Panel>
          <PanelTitle title="Gas and fees" subtitle="All amounts are denominated in RIO, the network fee token." />
          <DetailRows
            rows={[
              { label: "Gas price", value: <>{rio(tx.gas_price)} <Text as="span" color="explorer.muted">· {gwei(tx.gas_price)} Gwei</Text></> },
              {
                label: "Gas usage",
                value: (
                  <Flex align="center" gap="3" wrap="wrap">
                    <Text>
                      {numeral(tx.gas_used).format("0,0")} <Text as="span" color="explorer.muted">of {numeral(tx.gas_limit).format("0,0")}</Text>
                    </Text>
                    <Box w="200px" h="4px" borderRadius="full" bg="explorer.inset">
                      <Box h="full" borderRadius="full" bg="explorer.accent" w={`${Math.min(gasRatio, 100)}%`} />
                    </Box>
                    <Text color="explorer.muted">{numeral(gasRatio / 100).format("0.[0]%")}</Text>
                  </Flex>
                ),
              },
              {
                label: "Gas fees (Gwei)",
                value: (
                  <Flex gap="5" wrap="wrap">
                    <Text><Text as="span" color="explorer.muted">Base </Text>{gwei(tx.base_fee_per_gas)}</Text>
                    <Text><Text as="span" color="explorer.muted">Max </Text>{gwei(tx.max_fee_per_gas)}</Text>
                    <Text><Text as="span" color="explorer.muted">Max priority </Text>{gwei(tx.max_priority_fee_per_gas)}</Text>
                  </Flex>
                ),
              },
              { label: "Burnt fees", value: <Flex align="center" gap="2">{rio(tx.transaction_burnt_fee)}<Tag color="explorer.warning">Burnt</Tag></Flex> },
              { label: "Nonce / position", value: `${tx.nonce} / ${tx.position}` },
            ]}
          />
        </Panel>
      )}
    </Stack>
  );
}
