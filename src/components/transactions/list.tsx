import { Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import type { TxRow } from "@/utils/tx_label";
import { Panel } from "@/components/explorer/panel";
import { TxHashLink } from "@/components/explorer/tx_hash_link";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { Pager } from "@/components/explorer/pager";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { timeAgo } from "@/components/explorer/format";
import { RioAmount } from "@/components/explorer/rio_amount";
import { ExportCsvButton, SourceTabs, TxTypeMenu } from "@/components/explorer/tx_toolbar";
import { TimeRangePicker } from "@/components/explorer/time_range_picker";
import { PAGE_SIZE, useTransactions, useTransactionsExport } from "./hooks";

export const txColumns: Column<TxRow>[] = [
  {
    key: "hash",
    header: "Transaction hash",
    render: (row) => <TxHashLink hash={row.hash} label={row.label} />,
  },
  { key: "type", header: "Type", render: (row) => <Flex><TxTypeTag kind={row.label.kind} /></Flex> },
  { key: "name", header: "Name", render: (row) => <Flex><TxNameTag label={row.label} /></Flex> },
  { key: "status", header: "Status", render: (row) => <TxStatus success={row.success} /> },
  {
    key: "block",
    header: "Block",
    align: "end",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{numeral(row.height).format("0,0")}</NextLink>
      </ChakraLink>
    ),
  },
  {
    key: "fee",
    header: "Fee",
    align: "end",
    render: (row) => (
      <RioAmount wei={row.fee} />
    ),
  },
  {
    key: "gas",
    header: "Gas used",
    align: "end",
    render: (row) => `${numeral(row.gasUsed).format("0,0")} / ${numeral(row.gasWanted).format("0,0")}`,
  },
  { key: "age", header: "Age", align: "end", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
];

export function TransactionList() {
  const { items, loading, total, matching, page, setPage, filters, setFilters } = useTransactions();
  const exportCsv = useTransactionsExport(filters);
  const shown = Math.min(PAGE_SIZE, Math.max(total - (page - 1) * PAGE_SIZE, 0));

  return (
    <>
      <PageTitle
        title="Transactions"
        subtitle={matching !== null ? `Showing ${shown} of ${numeral(total).format("0,0")} transactions` : " "}
      />
      <Panel>
        <Flex justify="space-between" align="center" gap="3" wrap="wrap" mb="2">
          <SourceTabs value={filters.source} onChange={(source) => setFilters({ source })} />
          <Flex align="center" gap="2" wrap="wrap" justify="flex-end">
            <TxTypeMenu value={filters.type} onChange={(type) => setFilters({ type })} />
            <TimeRangePicker value={filters.range} onChange={(range) => setFilters({ range })} />
            <ExportCsvButton count={matching} needsRange={!filters.range} onExport={exportCsv} />
          </Flex>
        </Flex>
        <DataTable
          columns={txColumns}
          rows={items}
          rowKey={(row) => row.hash}
          loading={loading}
          skeletonRows={PAGE_SIZE}
          emptyText="No transactions match these filters"
        />
        {total > PAGE_SIZE && (
          <Flex justify="flex-end" mt="3">
            <Pager count={total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          </Flex>
        )}
      </Panel>
    </>
  );
}
