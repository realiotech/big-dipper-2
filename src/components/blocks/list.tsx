import React, { useEffect, useState } from "react";
import {
  Box,
  Center,
  Text,
  Table,
  Link as ChakraLink,
  VStack,
  Flex,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";
import { useBlocks } from "./hooks";
import Proposer from "../helper/proposer";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import HelpLink from "../helper/help_link";
import Pagination from "../layout/pagination";

const BlockItemMobile = ({ item, isItemLoaded, rowIndex }) => {
  const { name, address, imageUrl } = useProfileRecoil(item.proposer);

  if (!isItemLoaded(rowIndex)) {
    return <Skeleton h={"150px"} w="full" borderRadius="10px" mb="4" />;
  }

  return (
    <Box p="5" w="full">
      <VStack align="stretch">
        <Flex gap={1} direction="column">
          <Text >Height</Text>
          <HelpLink
            href={`/blocks/${item.height}`}
            value={numeral(item.height).format("0,0")}
          />
        </Flex>
        <Flex gap={1} direction="column">
          <Text >Proposer</Text>
          <Proposer address={address} image={imageUrl} name={name} />
        </Flex>
        <Flex gap={1} direction="column">
          <Text >Hash</Text>
          <Text>
            {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Flex gap={1} direction="column">
            <Text >Txs</Text>
            <Text>{numeral(item.txs).format("0,0")}</Text>
          </Flex>
          <Flex gap={1} direction="column">
            <Text >Time</Text>
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
    return <Skeleton h={"50px"} w="full" borderRadius="10px" mb="4" />;
  }

  return (
    <Table.Row key={`block-${rowIndex}`}>
      <Table.Cell>
        <HelpLink
          href={`/blocks/${item.height}`}
          value={numeral(item.height).format("0,0")}
        />
      </Table.Cell>
      <Table.Cell>
        <Proposer address={address} image={imageUrl} name={name} />
      </Table.Cell>
      <Table.Cell>
        {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
      </Table.Cell>
      <Table.Cell>{numeral(item.txs).format("0,0")}</Table.Cell>
      <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
    </Table.Row>
  );
};

const SkeletonBlockItem = ({ index }) => {
  return (
    <Table.Row key={`block-${index}`}>
      <Table.Cell>
        <Skeleton key={`block-${index}`} h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton key={`block-${index}`} h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton key={`block-${index}`} h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton key={`block-${index}`} h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton key={`block-${index}`} h={"20px"} w="full" mb="4" />
      </Table.Cell>
    </Table.Row>
  )
}

export function BlockList() {
  const { state, isItemLoaded, pageInfo, handlePageChange } = useBlocks();
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      borderRadius="20px"
      bgColor="#F6F7F8"
      py="5"
      px="8"
      minH="85vh"
      w="full"
    >
      <Text fontSize="2xl" fontWeight="bold" mb="4">
        Latest Blocks
      </Text>
      {isMobile !== undefined &&
        (isMobile ? (
          <VStack
            divideY={"1px"}
            divideStyle={"ridge"}
            borderRadius="10px"
            bg={"white"}
            gap={0}
          >
            {state.items.map((item, index) => (
              <BlockItemMobile
                key={`block-${index}`}
                item={item}
                rowIndex={index}
                isItemLoaded={isItemLoaded}
              />
            ))}
          </VStack>
        ) : (
          <Table.Root
            bgColor="inherit"
            showColumnBorder={false}
            h="full"
            w="full"
          >
            <Table.Header>
              <Table.Row bgColor="inherit">
                <Table.ColumnHeader>Height</Table.ColumnHeader>
                <Table.ColumnHeader>Proposer</Table.ColumnHeader>
                <Table.ColumnHeader>Hash</Table.ColumnHeader>
                <Table.ColumnHeader>Txs</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {!state.loading ? state.items.length === 0 ? (
                <Center
                  borderRadius="20px"
                  bgColor="#F6F7F8"
                  py="5"
                  px="8"
                  minH="65vh"
                  w="full"
                >
                  <Text>Nothing to show</Text>
                </Center>
              ) : state.items.map((item, index) => (
                <BlockItemWindow
                  key={`block-${index}`}
                  item={item}
                  rowIndex={index}
                  isItemLoaded={isItemLoaded}
                />
              )) : (
                Array.from({ length: 20 }).map((_, index) => (
                  <SkeletonBlockItem
                    index={index}
                  />
                ))
              )
              }
            </Table.Body>
          </Table.Root>
        ))}
      <Center w="full" py="4">
        <Pagination
          pageInfo={pageInfo}
          pageChangeFunc={handlePageChange}
          pageSizeChangeFunc={() => { }}
        />
      </Center>
    </Box>
  );
}
