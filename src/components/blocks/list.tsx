import React from "react";
import {
  Box,
  Center,
  Text,
  Table,
  VStack,
  Flex,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";

import { useBlocks } from "./hooks";
import Proposer from "../helper/proposer";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import HelpLink from "../helper/help_link";
import Pagination from "../layout/pagination";

const ROW_HEIGHT = "58px";      // fixed row height
const TEXT_LINE_HEIGHT = "20px";

const BlockItemMobile = ({ item, isItemLoaded, rowIndex }) => {
  const { name, address, imageUrl } = useProfileRecoil(item.proposer);

  if (!isItemLoaded(rowIndex)) {
    return <Skeleton h="150px" w="full" borderRadius="10px" />;
  }

  return (
    <Box p="5" w="full">
      <VStack align="stretch">
        <Flex direction="column" gap={1}>
          <Text fontSize="sm">Height</Text>
          <HelpLink
            href={`/blocks/${item.height}`}
            value={numeral(item.height).format("0,0")}
          />
        </Flex>

        <Flex direction="column" gap={1}>
          <Text fontSize="sm">Proposer</Text>
          <Proposer address={address} image={imageUrl} name={name} />
        </Flex>

        <Flex direction="column" gap={1}>
          <Text fontSize="sm">Hash</Text>
          <Text>
            {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
          </Text>
        </Flex>

        <Flex justify="space-between">
          <Flex direction="column" gap={1}>
            <Text fontSize="sm">Txs</Text>
            <Text>{numeral(item.txs).format("0,0")}</Text>
          </Flex>
          <Flex direction="column" gap={1}>
            <Text fontSize="sm">Time</Text>
            <Text>{dayjs.utc(item.timestamp).fromNow()}</Text>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
};

const BlockItemWindow = ({ item, isItemLoaded, rowIndex }) => {
  const { name, address, imageUrl } = useProfileRecoil(item.proposer);

  if (!isItemLoaded(rowIndex)) {
    return null;
  }

  return (
    <Table.Row
      h={ROW_HEIGHT}
      bg={{ base: "white", _dark: "#262626" }}
      key={`block-${rowIndex}`}
    >
      <Table.Cell py={0} verticalAlign="middle">
        <Text lineHeight={TEXT_LINE_HEIGHT}>
          <HelpLink
            href={`/blocks/${item.height}`}
            value={numeral(item.height).format("0,0")}
          />
        </Text>
      </Table.Cell>

      <Table.Cell py={0} verticalAlign="middle">
        <Proposer address={address} image={imageUrl} name={name} />
      </Table.Cell>

      <Table.Cell py={0} verticalAlign="middle">
        <Text lineHeight={TEXT_LINE_HEIGHT}>
          {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
        </Text>
      </Table.Cell>

      <Table.Cell py={0} verticalAlign="middle">
        <Text lineHeight={TEXT_LINE_HEIGHT}>
          {numeral(item.txs).format("0,0")}
        </Text>
      </Table.Cell>

      <Table.Cell py={0} verticalAlign="middle">
        <Text lineHeight={TEXT_LINE_HEIGHT}>
          {dayjs.utc(item.timestamp).fromNow()}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
};

const SkeletonBlockItem = ({ index }) => {
  return (
    <Table.Row
      h={ROW_HEIGHT}
      bg={{ base: "white", _dark: "#262626" }}
      key={`block-skeleton-${index}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Table.Cell
          key={i}
          py={0}
          verticalAlign="middle"
          borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}
        >
          <Skeleton h={TEXT_LINE_HEIGHT} w="full" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
};

export function BlockList() {
  const { state, isItemLoaded, pageInfo, handlePageChange } = useBlocks();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      borderRadius="20px"
      bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
      py="5"
      px="8"
      minH="85vh"
      w="full"
    >
      <Text fontSize="2xl" fontWeight="bold">
        Latest Blocks
      </Text>

      {isMobile ? (
        <VStack
          divideY="1px"
          divideColor={{ base: "gray.200", _dark: "gray.700" }}
          bg={{ base: "white", _dark: "#262626" }}
          borderRadius="10px"
          gap={0}
        >
          {state.items.map((item, index) => (
            <BlockItemMobile
              key={index}
              item={item}
              rowIndex={index}
              isItemLoaded={isItemLoaded}
            />
          ))}
        </VStack>
      ) : (
        <Table.Root w="full">
          <Table.Header>
            <Table.Row h={ROW_HEIGHT}>
              {["Height", "Proposer", "Hash", "Txs", "Time"].map((label) => (
                <Table.ColumnHeader key={label}>
                  {label}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body bg={{ base: "white", _dark: "#262626" }}>
            {!state.loading
              ? state.items.map((item, index) => (
                  <BlockItemWindow
                    key={index}
                    item={item}
                    rowIndex={index}
                    isItemLoaded={isItemLoaded}
                  />
                ))
              : Array.from({ length: 20 }).map((_, index) => (
                  <SkeletonBlockItem key={index} index={index} />
                ))}
          </Table.Body>
        </Table.Root>
      )}

      <Center w="full" py="4">
        <Pagination
          pageInfo={pageInfo}
          pageChangeFunc={handlePageChange}
          pageSizeChangeFunc={() => {}}
        />
      </Center>
    </Box>
  );
}
