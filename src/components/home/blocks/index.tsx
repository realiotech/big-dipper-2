import { Box, Flex, Link as ChakraLink, Skeleton, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import numeral from "numeral";
import { BLOCK_DETAILS } from "@/utils/go_to_page";
import { Panel, PanelHeader } from "@/components/explorer/panel";
import { ValidatorName } from "@/components/explorer/validator_name";
import { timeAgo } from "@/components/explorer/format";
import NoData from "@/components/helper/nodata";
import { useBlocks } from "./hooks";

const ROWS = 9;

const BlockRow = ({ item }) => (
  <Flex flex="1" align="center" gap="4" py="3" borderTopWidth="1px" borderColor="explorer.border" _first={{ borderTopWidth: 0 }}>
    <Box w="96px" flexShrink={0}>
      <ChakraLink asChild color="explorer.link" fontSize="sm">
        <NextLink href={BLOCK_DETAILS(item.height)}>{numeral(item.height).format("0,0")}</NextLink>
      </ChakraLink>
      <Text fontSize="xs" color="explorer.muted">
        {timeAgo(item.timestamp)}
      </Text>
    </Box>
    <Box flex="1" minW="0">
      <ValidatorName address={item.proposer} />
    </Box>
    <Text fontSize="sm" color="explorer.muted" whiteSpace="nowrap">
      {numeral(item.txs).format("0,0")} txs
    </Text>
  </Flex>
);

const Blocks = () => {
  const { state } = useBlocks(ROWS);

  return (
    <Panel display="flex" flexDirection="column">
      <PanelHeader title="Latest blocks" href="/blocks" />
      {state.loading ? (
        <Stack gap="3">
          {Array.from({ length: ROWS }).map((_, index) => (
            <Skeleton key={index} h="42px" />
          ))}
        </Stack>
      ) : state.items.length ? (
        <Flex direction="column" flex="1">
          {state.items.map((item) => <BlockRow key={item.height} item={item} />)}
        </Flex>
      ) : (
        <NoData />
      )}
    </Panel>
  );
};

export default Blocks;
