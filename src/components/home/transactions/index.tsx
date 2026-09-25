import { Box, Flex, Link as ChakraLink, Skeleton, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { BLOCK_DETAILS, TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { Panel, PanelHeader } from "@/components/explorer/panel";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { timeAgo } from "@/components/explorer/format";
import NoData from "@/components/helper/nodata";
import { useTransactions } from "./hooks";
import { TransactionType } from "./types";

const ROWS = 8;

const TxRow = ({ item }: { item: TransactionType }) => (
  <Flex justify="space-between" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" _first={{ borderTopWidth: 0 }}>
    <Box minW="0">
      <Flex align="center" gap="3" wrap="wrap">
        <ChakraLink asChild color="explorer.link" fontSize="sm">
          <NextLink href={TRANSACTION_DETAILS(item.hash)}>
            {getMiddleEllipsis(item.hash, { beginning: 10, ending: 6 })}
          </NextLink>
        </ChakraLink>
        <TxStatus success={item.success} />
      </Flex>
      <Flex align="center" gap="2" mt="1.5" wrap="wrap">
        <TxTypeTag kind={item.label.kind} />
        <TxNameTag label={item.label} />
        <ChakraLink asChild color="explorer.muted" fontSize="xs">
          <NextLink href={BLOCK_DETAILS(item.height)}>#{numeral(item.height).format("0,0")}</NextLink>
        </ChakraLink>
      </Flex>
    </Box>
    <Box textAlign="end" flexShrink={0}>
      <Text fontSize="sm" color="explorer.text">
        {/* numeral returns NaN for tiny values such as EVM fees (~1e-12) */}
        {numeral(Number(item.fee.toFixed(4))).format("0,0.[0000]")}{" "}
        <Text as="span" color="explorer.muted">
          RIO
        </Text>
      </Text>
      <Text fontSize="xs" color="explorer.muted" mt="1.5">
        {timeAgo(item.timestamp)}
      </Text>
    </Box>
  </Flex>
);

const Transactions = () => {
  const { state } = useTransactions(ROWS);

  return (
    <Panel>
      <PanelHeader title="Latest transactions" href="/transactions" />
      {state.loading ? (
        <Stack gap="3">
          {Array.from({ length: ROWS }).map((_, index) => (
            <Skeleton key={index} h="52px" />
          ))}
        </Stack>
      ) : state.items.length ? (
        state.items.map((item) => <TxRow key={item.hash} item={item} />)
      ) : (
        <NoData />
      )}
    </Panel>
  );
};

export default Transactions;
