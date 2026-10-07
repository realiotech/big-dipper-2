import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useEvmHashOfQuery } from "@/graphql/types/general_types";
import { Box, Flex, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import useTranslation from "next-translate/useTranslation";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { txLabel } from "@/utils/tx_label";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { DetailRows } from "@/components/explorer/detail_rows";
import { CopyButton } from "@/components/explorer/copy_button";
import { CodeBlock } from "@/components/explorer/code_block";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { formatUtc, timeAgo } from "@/components/explorer/format";
import { formatNumber } from "@/utils/format_token";
import { NotFound } from "@/components/explorer/not_found";
import { getMessageByType } from "../msg/utils";
import { useTransactionDetails } from "./hooks";

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

/** One message: its tags, the type-specific summary and the raw JSON. */
const MessageCard = ({ model, raw }: { model: unknown; raw: Record<string, any> }) => {
  const { t } = useTranslation("transactions");
  const label = txLabel([raw]);
  const summary = getMessageByType(model, false, t);

  return (
    <Box bg="explorer.inset" borderWidth="1px" borderColor="explorer.border" borderRadius="6px" p="4">
      <Flex gap="2" mb="3" wrap="wrap">
        <TxTypeTag kind={label.kind} />
        <TxNameTag label={label} />
      </Flex>
      <Box fontSize="sm" color="explorer.text" mb="3" overflowX="auto" wordBreak="break-word">
        {summary.message}
      </Box>
      <CodeBlock label={raw["@type"] ?? "message"} value={raw} />
    </Box>
  );
};

export default function TransactionDetails() {
  const router = useRouter();
  const { state } = useTransactionDetails();
  const { overview, logs, messages, rawMessages, label, loading, exists } = state;

  // Lists link Ethereum transactions by their Cosmos hash; those are shown on
  // their EVM page. The lookup starts with the page, alongside the Cosmos
  // query, and the Cosmos view waits for it so it never flashes first.
  const cosmosHash = String(router.query.tx ?? "").toUpperCase();
  const { data: evm, loading: evmLoading } = useEvmHashOfQuery({ variables: { hash: cosmosHash }, skip: !router.isReady || !cosmosHash });
  const evmHash = evm?.etransaction?.[0]?.ehash;
  useEffect(() => {
    if (evmHash) router.replace(TRANSACTION_DETAILS(evmHash));
  }, [evmHash, router]);
  const crumbs = [{ label: "Transactions", href: "/transactions" }, { label: "Details" }];
  const gasRatio = overview.gasWanted ? (overview.gasUsed / overview.gasWanted) * 100 : 0;

  if (!router.isReady || evmLoading || evmHash) {
    return (
      <Stack gap="5">
        <PageTitle crumbs={crumbs} title="Transaction" />
        <Panel>
          <PanelTitle title="Overview" />
          <DetailRows loading rows={["Status", "Block", "Time", "Fee", "Gas"].map((label) => ({ label, value: null }))} />
        </Panel>
      </Stack>
    );
  }

  if (!exists) {
    return <NotFound />;
  }

  return (
    <Stack gap="5">
      <PageTitle
        crumbs={crumbs}
        title={
          <Flex as="span" align="center" gap="3" wrap="wrap">
            Transaction
            {label && <TxTypeTag kind={label.kind} />}
            {label && <TxNameTag label={label} />}
          </Flex>
        }
        subtitle={
          overview.hash && (
            <Flex as="span" align="center" gap="1">
              <Text as="span" color="explorer.link" wordBreak="break-all">
                {overview.hash}
              </Text>
              <CopyButton value={overview.hash} label="Copy transaction hash" />
            </Flex>
          )
        }
      />

      <Panel>
        <PanelTitle title="Overview" />
        <DetailRows
          loading={loading}
          rows={[
            { label: "Status", value: <TxStatus success={overview.success} /> },
            ...(overview.error ? [{ label: "Error", value: <Text color="explorer.danger">{overview.error}</Text> }] : []),
            {
              label: "Block",
              value: (
                <ChakraLink asChild color="explorer.link">
                  <NextLink href={BLOCK_DETAILS(overview.height)}>{numeral(overview.height).format("0,0")}</NextLink>
                </ChakraLink>
              ),
            },
            {
              label: "Timestamp",
              value: overview.timestamp && (
                <Text>
                  {timeAgo(overview.timestamp)}{" "}
                  <Text as="span" color="explorer.muted">
                    ({formatUtc(overview.timestamp)})
                  </Text>
                </Text>
              ),
            },
            {
              label: "Fee",
              value: (
                <>
                  {/* Exact: fees run to 18 decimals, e.g. 0.00296549 or 0.000000000003710588 RIO */}
                  {formatNumber(overview.fee.value)}{" "}
                  <Text as="span" color="explorer.muted">
                    {overview.fee.displayDenom?.toUpperCase()}
                  </Text>
                </>
              ),
            },
            {
              label: "Gas (used / wanted)",
              value: (
                <>
                  {numeral(overview.gasUsed).format("0,0")} / {numeral(overview.gasWanted).format("0,0")}{" "}
                  <Text as="span" color="explorer.muted">
                    · {numeral(gasRatio / 100).format("0.0%")}
                  </Text>
                </>
              ),
            },
            { label: "Memo", value: overview.memo || <Text color="explorer.muted">—</Text> },
          ]}
        />
      </Panel>

      <Panel>
        <PanelTitle title="Messages" subtitle={loading ? undefined : `${rawMessages.length} message${rawMessages.length === 1 ? "" : "s"}`} />
        <Stack gap="3">
          {(messages.items as unknown[]).map((model, index) => (
            <MessageCard key={index} model={model} raw={rawMessages[index] ?? {}} />
          ))}
        </Stack>
      </Panel>

      {logs && (
        <Panel>
          <PanelTitle title="Event logs" subtitle="Raw events emitted by this transaction" />
          <CodeBlock label="events" value={logs} />
        </Panel>
      )}
    </Stack>
  );
}
