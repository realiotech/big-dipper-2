import { Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DataTable, Column } from "@/components/explorer/data_table";
import { Pager } from "@/components/explorer/pager";
import { ValidatorName } from "@/components/explorer/validator_name";
import { timeAgo } from "@/components/explorer/format";
import { PAGE_SIZE, useBlocks } from "./hooks";
import type { BlockType } from "./types";

const blockLink = (height: number) => (
  <ChakraLink asChild color="explorer.link">
    <NextLink href={BLOCK_DETAILS(height)}>{numeral(height).format("0,0")}</NextLink>
  </ChakraLink>
);

const columns: Column<BlockType>[] = [
  { key: "height", header: "Height", width: "130px", render: (row) => blockLink(row.height) },
  { key: "age", header: "Age", width: "150px", render: (row) => <Text color="explorer.muted">{timeAgo(row.timestamp)}</Text> },
  { key: "proposer", header: "Proposed by", render: (row) => <ValidatorName address={row.proposer} /> },
  { key: "txs", header: "Txns", align: "end", width: "80px", render: (row) => numeral(row.txs).format("0,0") },
  { key: "gas", header: "Gas used", align: "end", width: "120px", render: (row) => numeral(row.gasUsed).format("0,0") },
  {
    key: "hash",
    header: "Block hash",
    width: "200px",
    render: (row) => (
      <ChakraLink asChild color="explorer.link">
        <NextLink href={BLOCK_DETAILS(row.height)}>{getMiddleEllipsis(row.hash, { beginning: 10, ending: 8 })}</NextLink>
      </ChakraLink>
    ),
  },
];

export const BlockList = () => {
  const { items, loading, total, page, setPage } = useBlocks();

  return (
    <>
      <PageTitle
        title="Blocks"
        subtitle={total ? `Showing ${PAGE_SIZE} of ${numeral(total).format("0,0")} blocks` : " "}
      />
      <Panel>
        {total > 0 && (
          <Flex justify="flex-end" mb="2">
            <Pager count={total} pageSize={PAGE_SIZE} page={page} onPageChange={setPage} />
          </Flex>
        )}
        <DataTable columns={columns} rows={items} rowKey={(row) => row.height} loading={loading} skeletonRows={PAGE_SIZE} />
      </Panel>
    </>
  );
};
