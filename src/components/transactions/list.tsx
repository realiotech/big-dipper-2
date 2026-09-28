import { Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import type { TxRow } from "@/utils/tx_label";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { Pager } from "@/components/explorer/pager";
import { CopyButton } from "@/components/explorer/copy_button";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { formatAmount, timeAgo } from "@/components/explorer/format";
import { PAGE_SIZE, useTransactions } from "./hooks";

export const txColumns: Column<TxRow>[] = [
  {
    key: "hash",
    header: "Transaction hash",
    render: (row) => (
      <Flex align="center" gap="1">
        <ChakraLink asChild color="explorer.link">
          <NextLink href={TRANSACTION_DETAILS(row.hash)}>{getMiddleEllipsis(row.hash, { beginning: 10, ending: 6 })}</NextLink>
        </ChakraLink>
        <CopyButton value={row.hash} label="Copy transaction hash" />
      </Flex>
    ),
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
      <>
        {formatAmount(row.fee)}{" "}
        <Text as="span" color="explorer.muted" fontSize="xs">
          RIO
        </Text>
      </>
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
  const { items, loading, total, page, setPage } = useTransactions();

  return (
    <>
      <PageTitle
        title="Transactions"
        subtitle={total ? `Showing ${PAGE_SIZE} of ${numeral(total).format("0,0")} transactions` : " "}
      />
      <Panel>
        {total > 0 && (
          <Flex justify="flex-end" mb="2">
            <Pager count={total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          </Flex>
        )}
        <DataTable columns={txColumns} rows={items} rowKey={(row) => row.hash} loading={loading} skeletonRows={PAGE_SIZE} />
      </Panel>
    </>
  );
}
