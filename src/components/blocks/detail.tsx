import { Box, Flex, IconButton, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import dayjs from "@/utils/dayjs";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DetailRows } from "@/components/explorer/detail_rows";
import { DataTable, Column } from "@/components/explorer/data_table";
import { CopyButton } from "@/components/explorer/copy_button";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { ValidatorName } from "@/components/explorer/validator_name";
import { timeAgo } from "@/components/explorer/format";
import NoData from "@/components/helper/nodata";
import { useBlockDetails } from "./hooks";
import type { BlockTransaction } from "./types";

const utc = (timestamp: string) => dayjs.utc(timestamp).format("YYYY-MM-DD HH:mm:ss [UTC]");

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

const StepButton = ({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) => (
  <IconButton
    asChild={Boolean(href)}
    aria-label={label}
    disabled={!href}
    variant="outline"
    size="sm"
    borderRadius="full"
    borderColor="explorer.border"
    color="explorer.text"
  >
    {href ? <NextLink href={href}>{children}</NextLink> : children}
  </IconButton>
);

const txColumns: Column<BlockTransaction>[] = [
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
    key: "fee",
    header: "Fee",
    align: "end",
    render: (row) => (
      <>
        {/* numeral returns NaN for tiny values such as EVM fees (~1e-12) */}
        {numeral(Number(row.fee.toFixed(6))).format("0,0.[000000]")}{" "}
        <Text as="span" color="explorer.muted">
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
];

export default function BlockDetails() {
  const { state, height } = useBlockDetails();
  const { overview, transactions, signatures, loading, exists } = state;
  const crumbs = [{ label: "Blocks", href: "/blocks" }, { label: `#${numeral(height).format("0,0")}` }];

  if (!exists) {
    return (
      <>
        <PageTitle crumbs={crumbs} title={`Block #${numeral(height).format("0,0")}`} />
        <Panel>
          <NoData />
        </Panel>
      </>
    );
  }

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={crumbs}
        title={`Block #${numeral(height).format("0,0")}`}
        subtitle={overview.timestamp ? utc(overview.timestamp) : " "}
        actions={
          <Flex gap="2">
            <StepButton label="Previous block" href={height > 1 ? BLOCK_DETAILS(height - 1) : undefined}>
              <LuChevronLeft />
            </StepButton>
            <StepButton label="Next block" href={BLOCK_DETAILS(height + 1)}>
              <LuChevronRight />
            </StepButton>
          </Flex>
        }
      />

      <Panel>
        <PanelTitle title="Overview" />
        <DetailRows
          loading={loading}
          rows={[
            { label: "Height", value: numeral(overview.height).format("0,0") },
            {
              label: "Block hash",
              value: (
                <Flex align="center" gap="1">
                  <Text color="explorer.link">{overview.hash}</Text>
                  <CopyButton value={overview.hash} label="Copy block hash" />
                </Flex>
              ),
            },
            {
              label: "Timestamp",
              value: overview.timestamp && (
                <Text>
                  {timeAgo(overview.timestamp)}{" "}
                  <Text as="span" color="explorer.muted">
                    ({utc(overview.timestamp)})
                  </Text>
                </Text>
              ),
            },
            { label: "Proposer", value: overview.proposer ? <ValidatorName address={overview.proposer} color="explorer.link" /> : "—" },
            { label: "Transactions", value: numeral(overview.txs).format("0,0") },
            { label: "Gas used", value: numeral(overview.gasUsed).format("0,0") },
            { label: "Signatures", value: `${signatures.length} validators` },
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle title="Transactions" subtitle={loading ? undefined : `${transactions.length} in this block`} />
        <DataTable columns={txColumns} rows={transactions} rowKey={(row) => row.hash} loading={loading} skeletonRows={3} />
      </Panel>

      <Panel>
        <PanelTitle title="Signatures" subtitle={loading ? undefined : `${signatures.length} pre-commits`} />
        {signatures.length ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap="3">
            {signatures.map((address) => (
              <Box key={address} px="3" py="2" bg="explorer.inset" borderWidth="1px" borderColor="explorer.border" borderRadius="4px">
                <ValidatorName address={address} />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          !loading && <NoData />
        )}
      </Panel>
    </Stack>
  );
}
