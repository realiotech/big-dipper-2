import React from "react";
import {
  Box,
  Text,
  Flex,
  Table,
  For,
  useBreakpointValue,
  Link as ChakraLink,
  VStack,
  StackSeparator,
  Center,
} from "@chakra-ui/react";
import { TxItem, SkeletonTxItem } from "@/components/transactions/item";
import Link from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Status } from "../ui/status";
import NoData from "../helper/nodata";

const TxItemMobile = ({ item, rowIndex }) => {
  return (
    <VStack align="stretch" p={4} key={`transaction-${rowIndex}`}>
      <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
        <Text>Block</Text>
        <ChakraLink asChild colorPalette="blue">
          <Link href={`/blocks/${item.height}`}>
            {numeral(item.height).format("0,0")}
          </Link>
        </ChakraLink>
      </Flex>
      <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
        <Text>Hash</Text>
        <ChakraLink asChild colorPalette="blue">
          <Link href={`/transactions/${item.hash}`}>
            {getMiddleEllipsis(item.hash, { beginning: 12, ending: 6 })}
          </Link>
        </ChakraLink>
      </Flex>
      <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
        <Text>Messages</Text>
        <Text>{numeral(item.messages.count).format("0,0")}</Text>
      </Flex>
      <Flex justify="space-between">
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Result</Text>
          <Status value={item.success ? "success" : "error"}>
            <Text>{item.success ? "Success" : "Failed"}</Text>
          </Status>
        </Flex>
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Time</Text>
          <Text>{dayjs.utc(item.timestamp).fromNow()}</Text>
        </Flex>
      </Flex>
    </VStack>
  );
};

export default function TxTable({ transactions, isLoading }) {
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  return !isMobile ? (
    <Box bg="white" borderRadius="md" overflowY="auto" maxH="auto">
      <Table.Root showColumnBorder={false} h="full" w="full">
        <Table.Header>
          <Table.Row bg="#FAFBFC">
            <Table.ColumnHeader>Block</Table.ColumnHeader>
            <Table.ColumnHeader>Hash</Table.ColumnHeader>
            <Table.ColumnHeader>Messages</Table.ColumnHeader>
            <Table.ColumnHeader>Result</Table.ColumnHeader>
            <Table.ColumnHeader>Time</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            !isLoading ? transactions.length === 0 ? (
                <Table.Row>
                <Table.Cell colSpan={5} textAlign="center">
                  <Center borderRadius="20px" bgColor="#FAFBFC" py="5" px="8" minH="65vh" w="full">
                    <NoData />
                  </Center>
                </Table.Cell>
              </Table.Row>
            ) : (
              <For each={transactions}>
                {(item, index) => <TxItem item={item} rowIndex={index} />}
              </For>
            ) : (
              Array.from({ length: 20 }).map((_, index) => (
                <SkeletonTxItem
                  index={index}
                />
              ))
            )
          }
        </Table.Body>
      </Table.Root>
    </Box>
  ) : (
    <Box bg="white" borderRadius="md" overflowY="auto" maxH="auto">
      <VStack px={3} separator={<StackSeparator />} align="stretch">
        {transactions.map((item, index) => (
          <TxItemMobile item={item} rowIndex={index} />
        ))}
      </VStack>
    </Box>
  );
}
