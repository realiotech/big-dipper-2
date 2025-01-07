import React from "react";
import {
  Box,
  Text,
  Flex,
  Table,
  Image,
  For,
  useBreakpointValue,
  Link as ChakraLink,
  VStack,
  StackSeparator,
  Skeleton,
} from "@chakra-ui/react";
import {TxItem, SkeletonTxItem} from "@/components/transactions/item";
import Link from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Status } from "../ui/status";

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
  if (!transactions?.length) return;
  <Flex justify="center" align="center" h="100px">
    <Box textAlign="center" color="gray.400">
      <Box alignItems="center" boxSize="100px">
        <Image src="/images/logo.svg" h={100} width={100} alt="test" />
      </Box>
      <Text mt={2}>Nothing to show</Text>
    </Box>
  </Flex>;
  return !isMobile ? (
    <Box bg="white" borderRadius="md" overflowY="auto" maxH="auto">
      <Table.Root showColumnBorder={false} h="full" w="full">
        <Table.Header>
          <Table.Row bg="#F6F7F8">
            <Table.ColumnHeader>Block</Table.ColumnHeader>
            <Table.ColumnHeader>Hash</Table.ColumnHeader>
            <Table.ColumnHeader>Messages</Table.ColumnHeader>
            <Table.ColumnHeader>Result</Table.ColumnHeader>
            <Table.ColumnHeader>Time</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {
            !isLoading ? (
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
