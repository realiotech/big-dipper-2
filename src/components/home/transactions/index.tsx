import { Box, Flex, Link as ChakraLink, Skeleton, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import { Panel, PanelHeader } from "@/components/explorer/panel";
import { TxNameTag, TxStatus, TxTypeTag } from "@/components/explorer/badges";
import { timeAgo } from "@/components/explorer/format";
import { RioAmount } from "@/components/explorer/rio_amount";
import { TxHashLink } from "@/components/explorer/tx_hash_link";
import NoData from "@/components/helper/nodata";
import { useTransactions } from "./hooks";
import { TransactionType } from "./types";

const ROWS = 8;

const TxRow = ({ item }: { item: TransactionType }) => (
  <Flex flex="1" align="center" justify="space-between" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" _first={{ borderTopWidth: 0 }}>
    <Box minW="0">
      <Flex align="center" gap="3" wrap="wrap">
        <Box fontSize="sm">
          <TxHashLink hash={item.hash} label={item.label} copy={false} />
        </Box>
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
        <RioAmount wei={item.fee} />
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
    <Panel display="flex" flexDirection="column">
      <PanelHeader title="Latest transactions" href="/transactions" />
      {state.loading ? (
        <Stack gap="3">
          {Array.from({ length: ROWS }).map((_, index) => (
            <Skeleton key={index} h="52px" />
          ))}
        </Stack>
      ) : state.items.length ? (
        <Flex direction="column" flex="1">
          {state.items.map((item) => <TxRow key={item.hash} item={item} />)}
        </Flex>
      ) : (
        <NoData />
      )}
    </Panel>
  );
};

export default Transactions;
