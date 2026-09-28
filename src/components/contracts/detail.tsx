import React, { useState } from "react";
import { Box, Flex, Grid, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { evmMethodFromInput } from "@/utils/tx_label";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { StatCard } from "@/components/explorer/stat_card";
import { DetailRows } from "@/components/explorer/detail_rows";
import { DataTable, Column } from "@/components/explorer/data_table";
import { ExplorerTabs, TabPanel } from "@/components/explorer/tabs";
import { CursorPager } from "@/components/explorer/cursor_pager";
import { CodeBlock } from "@/components/explorer/code_block";
import { CopyButton } from "@/components/explorer/copy_button";
import { StatusTag, Tag, TxStatus } from "@/components/explorer/badges";
import { CONTRACT_DETAILS, EvmAddress } from "@/components/explorer/evm_address";
import { formatCompact, formatUtc, timeAgo } from "@/components/explorer/format";
import { NotFound } from "@/components/explorer/not_found";
import { BlockscoutAddress, formatUnits, useBlockscout, useBlockscoutList } from "@/components/explorer/blockscout";
import { InternalTx, internalColumns, Log, LogList, rio, TokenTransfer, transferColumns, transferAmount } from "@/components/evm/columns";

type AddressInfo = BlockscoutAddress & {
  coin_balance?: string | null;
  creator_address_hash?: string | null;
  creation_transaction_hash?: string | null;
  creation_status?: string | null;
  block_number_balance_updated_at?: number | null;
  has_logs?: boolean;
  token?: { symbol?: string | null; name?: string | null; type?: string | null } | null;
};
type Counters = { transactions_count: string; token_transfers_count: string; gas_usage_count: string };
type SmartContract = {
  is_verified?: boolean | null;
  name?: string | null;
  compiler_version?: string | null;
  language?: string | null;
  optimization_enabled?: boolean | null;
  license_type?: string | null;
  verified_at?: string | null;
  source_code?: string | null;
  abi?: unknown[] | null;
  deployed_bytecode?: string | null;
};
type AddressTx = {
  hash: string;
  status: string;
  block_number: number;
  timestamp: string;
  from: BlockscoutAddress;
  to?: BlockscoutAddress | null;
  value: string;
  fee?: { value: string };
  raw_input?: string;
  decoded_input?: { method_call?: string } | null;
};
type TokenBalance = { token: { address_hash?: string; address?: string; name?: string | null; symbol?: string | null; decimals?: string | null; type?: string }; value: string };

const txColumns: Column<AddressTx>[] = [
  {
    key: "hash",
    header: "Transaction hash",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={TRANSACTION_DETAILS(row.hash)}>{getMiddleEllipsis(row.hash, { beginning: 10, ending: 6 })}</NextLink>
      </ChakraLink>
    ),
  },
  { key: "method", header: "Method", render: (row) => <Flex><Tag color="explorer.evm">{row.decoded_input?.method_call?.split("(")[0] || evmMethodFromInput(row.raw_input)}</Tag></Flex> },
  { key: "status", header: "Status", render: (row) => <TxStatus success={row.status === "ok"} /> },
  {
    key: "block",
    header: "Block",
    align: "end",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.block_number)}>{numeral(row.block_number).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
  { key: "from", header: "From", render: (row) => <Box pl="4"><EvmAddress address={row.from} short /></Box> },
  { key: "value", header: "Value", align: "end", render: (row) => rio(row.value) },
  { key: "age", header: "Age", align: "end", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
];

const tokenColumns: Column<TokenBalance>[] = [
  { key: "token", header: "Token", render: (row) => <Text color="explorer.text">{row.token.name ?? row.token.symbol ?? "Unnamed token"}</Text> },
  { key: "type", header: "Type", render: (row) => <Flex><Tag>{row.token.type ?? "ERC-20"}</Tag></Flex> },
  { key: "balance", header: "Balance", align: "end", render: (row) => `${formatUnits(row.value, Number(row.token.decimals ?? 18))} ${row.token.symbol ?? ""}` },
];

const verificationTag = (verified?: boolean | null) => (
  <StatusTag tone={verified ? "success" : "neutral"}>{verified ? "Verified" : "Not verified"}</StatusTag>
);

export default function ContractDetails() {
  const router = useRouter();
  const address = String(router.query.address ?? "");
  const valid = /^0x[0-9a-fA-F]{40}$/.test(address);
  const [tab, setTab] = useState("details");

  const { data: info, loading, notFound } = useBlockscout<AddressInfo>(valid ? `addresses/${address}` : null);
  const { data: counters } = useBlockscout<Counters>(valid ? `addresses/${address}/counters` : null);
  const { data: contract, loading: contractLoading } = useBlockscout<SmartContract>(valid ? `smart-contracts/${address}` : null);
  const base = valid ? `addresses/${address}` : null;
  const txs = useBlockscoutList<AddressTx>(tab === "transactions" ? `${base}/transactions` : null);
  const transfers = useBlockscoutList<TokenTransfer>(tab === "transfers" ? `${base}/token-transfers` : null);
  const tokens = useBlockscoutList<TokenBalance>(base ? `${base}/tokens` : null);
  const internal = useBlockscoutList<InternalTx>(tab === "internal" ? `${base}/internal-transactions` : null);
  const logs = useBlockscoutList<Log>(tab === "logs" ? `${base}/logs` : null);

  if (!valid || notFound || (info && !info.is_contract)) return <NotFound />;

  const verified = Boolean(info?.is_verified || contract?.is_verified);
  const implementations = info?.implementations ?? [];
  const isProxy = Boolean(info?.proxy_type) || implementations.length > 0;
  const name = info?.name || contract?.name || "Contract";
  const pager = (list: { page: number; hasPrevious: boolean; hasNext: boolean; previous: () => void; next: () => void }) => (
    <Flex justify="flex-end" mt="3">
      <CursorPager page={list.page} hasPrevious={list.hasPrevious} hasNext={list.hasNext} onPrevious={list.previous} onNext={list.next} />
    </Flex>
  );

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={[{ label: "Contracts", href: "/contracts" }, { label: "Details" }]}
        title={name}
        subtitle={
          <Flex as="span" align="center" gap="2" wrap="wrap">
            <Text as="span" color="explorer.link" wordBreak="break-all">
              {address}
            </Text>
            <CopyButton value={address} label="Copy contract address" />
            {isProxy && <Tag color="explorer.link">Proxy</Tag>}
            {!loading && verificationTag(verified)}
          </Flex>
        }
      />

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap="4">
        <StatCard
          label="Balance"
          loading={loading}
          value={formatUnits(info?.coin_balance).replace(/(\.\d{2})\d+$/, "$1")}
          suffix="RIO"
          rows={[
            { label: "Tokens held", value: tokens.loading ? "…" : `${tokens.items.length}${tokens.hasNext ? "+" : ""}` },
            { label: "Token", value: info?.token ? `${info.token.symbol ?? info.token.name} · ${info.token.type ?? ""}` : "—" },
          ]}
        />
        <StatCard
          label="Transactions"
          loading={!counters}
          value={numeral(counters?.transactions_count ?? 0).format("0,0")}
          rows={[
            { label: "Token transfers", value: numeral(counters?.token_transfers_count ?? 0).format("0,0") },
            { label: "Logs emitted", value: info?.has_logs ? "Yes" : "None" },
          ]}
        />
        <StatCard
          label="Gas used"
          loading={!counters}
          value={formatCompact(Number(counters?.gas_usage_count ?? 0))}
          rows={[
            { label: "Exact", value: numeral(counters?.gas_usage_count ?? 0).format("0,0") },
            { label: "Last balance update", value: info?.block_number_balance_updated_at ? numeral(info.block_number_balance_updated_at).format("0,0") : "—" },
          ]}
        />
        <StatCard
          label="Contract type"
          loading={loading}
          value={isProxy ? "Proxy" : "Contract"}
          rows={[
            { label: "Implementations", value: implementations.length },
            { label: "Verification", value: verified ? "Verified" : "Not verified" },
          ]}
        />
      </SimpleGrid>

      <Panel>
        <ExplorerTabs
          value={tab}
          onChange={setTab}
          items={[
            { value: "details", label: "Details" },
            { value: "contract", label: "Contract" },
            { value: "transactions", label: "Transactions", count: counters ? Number(counters.transactions_count) : undefined },
            { value: "transfers", label: "Token transfers", count: counters ? Number(counters.token_transfers_count) : undefined },
            { value: "tokens", label: "Tokens" },
            { value: "internal", label: "Internal txns" },
            { value: "logs", label: "Logs" },
          ]}
        >
          <TabPanel value="details" pt="2">
            <DetailRows
              loading={loading}
              rows={[
                { label: "Address", value: <Flex align="center" gap="1"><Text color="explorer.link">{address}</Text><CopyButton value={address} /></Flex> },
                {
                  label: "Creator",
                  value: info?.creator_address_hash ? (
                    <Flex align="center" gap="2" wrap="wrap">
                      <EvmAddress address={{ hash: info.creator_address_hash }} short />
                      {info.creation_transaction_hash && (
                        <>
                          <Text color="explorer.muted">at txn</Text>
                          <ChakraLink asChild color="explorer.link">
                            <NextLink href={TRANSACTION_DETAILS(info.creation_transaction_hash)}>{getMiddleEllipsis(info.creation_transaction_hash, { beginning: 6, ending: 4 })}</NextLink>
                          </ChakraLink>
                        </>
                      )}
                      {info.creation_status && <TxStatus success={info.creation_status === "success"} />}
                    </Flex>
                  ) : "—",
                },
                { label: "Balance", value: rio(info?.coin_balance) },
                { label: "Transactions", value: numeral(counters?.transactions_count ?? 0).format("0,0") },
                { label: "Token transfers", value: numeral(counters?.token_transfers_count ?? 0).format("0,0") },
                { label: "Gas used", value: numeral(counters?.gas_usage_count ?? 0).format("0,0") },
                {
                  label: "Last balance update",
                  value: info?.block_number_balance_updated_at ? (
                    <ChakraLink asChild color="explorer.link">
                      <NextLink href={BLOCK_DETAILS(info.block_number_balance_updated_at)}>{numeral(info.block_number_balance_updated_at).format("0,0")}</NextLink>
                    </ChakraLink>
                  ) : "—",
                },
                {
                  label: "Verification",
                  value: (
                    <Flex align="center" gap="3">
                      {verificationTag(verified)}
                      <Text color="explorer.muted">
                        {verified ? `Verified ${contract?.verified_at ? formatUtc(contract.verified_at) : ""}` : "Source code has not been published for this contract."}
                      </Text>
                    </Flex>
                  ),
                },
              ]}
            />
          </TabPanel>
          <TabPanel value="contract" pt="2">
            {contractLoading ? (
              <Text fontSize="sm" color="explorer.muted" py="4">Loading…</Text>
            ) : verified ? (
              <Stack gap="4">
                <DetailRows
                  rows={[
                    { label: "Contract name", value: contract?.name ?? name },
                    { label: "Compiler", value: contract?.compiler_version ?? "—" },
                    { label: "Language", value: contract?.language ?? "—" },
                    { label: "Optimization", value: contract?.optimization_enabled ? "Enabled" : "Disabled" },
                    { label: "License", value: !contract?.license_type || contract.license_type === "none" ? "Not specified" : contract.license_type },
                  ]}
                />
                {contract?.source_code && <CodeBlock label="source code" value={contract.source_code} />}
                {contract?.abi && <CodeBlock label="ABI" value={contract.abi} />}
              </Stack>
            ) : (
              <Stack gap="3">
                <Text fontSize="sm" color="explorer.muted">
                  Source code has not been published for this contract. The deployed bytecode is shown below.
                </Text>
                <CodeBlock label="deployed bytecode" value={contract?.deployed_bytecode ?? ""} />
              </Stack>
            )}
          </TabPanel>
          <TabPanel value="transactions" pt="0">
            <DataTable columns={txColumns} rows={txs.items} rowKey={(row) => row.hash} loading={txs.loading} emptyText="No transactions" />
            {pager(txs)}
          </TabPanel>
          <TabPanel value="transfers" pt="0">
            <DataTable columns={transferColumns} rows={transfers.items} rowKey={(row) => `${row.from?.hash}:${row.to?.hash}:${transferAmount(row)}`} loading={transfers.loading} emptyText="No token transfers" />
            {pager(transfers)}
          </TabPanel>
          <TabPanel value="tokens" pt="0">
            <DataTable columns={tokenColumns} rows={tokens.items} rowKey={(row) => row.token.address_hash ?? row.token.address ?? row.token.symbol ?? ""} loading={tokens.loading} emptyText="This contract holds no tokens" />
            {pager(tokens)}
          </TabPanel>
          <TabPanel value="internal" pt="0">
            <DataTable columns={internalColumns} rows={internal.items} rowKey={(row) => `${row.index}:${row.from?.hash}`} loading={internal.loading} emptyText="No internal transactions" />
            {pager(internal)}
          </TabPanel>
          <TabPanel value="logs" pt="2">
            <LogList logs={logs} />
            {pager(logs)}
          </TabPanel>
        </ExplorerTabs>
      </Panel>

      {implementations.length > 0 && (
        <Panel>
          <Text fontSize="md" fontWeight="600" color="explorer.text">
            Implementations
          </Text>
          <Text fontSize="sm" color="explorer.muted" mb="4">
            Proxy delegates calls to the logic contract{implementations.length === 1 ? "" : "s"} below.
          </Text>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap="3">
            {implementations.map((impl, index) => {
              const hash = impl.address_hash ?? impl.address ?? "";
              return (
                <Flex key={hash} align="center" gap="2" px="3" py="2" bg="explorer.inset" borderWidth="1px" borderColor="explorer.border" borderRadius="4px" fontSize="sm" minW="0">
                  <Text color="explorer.muted">{index + 1}</Text>
                  <ChakraLink asChild color="explorer.link" truncate>
                    <NextLink href={CONTRACT_DETAILS(hash)}>{impl.name || hash}</NextLink>
                  </ChakraLink>
                  <CopyButton value={hash} />
                </Flex>
              );
            })}
          </Grid>
        </Panel>
      )}
    </Stack>
  );
}
