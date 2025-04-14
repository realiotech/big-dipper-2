import React from "react";
import {
  Table,
  VStack,
  Box,
  Center,
  HStack,
} from "@chakra-ui/react";
import { Skeleton } from "../../ui/skeleton";
import NoData from "../../helper/nodata";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../../ui/pagination";
import HelpLink from "../../helper/help_link";
import { ethToRealionetwork } from "@realiotech/address-generator";
import { dayjs, TRANSACTION_DETAILS } from "@/utils";
import numeral from "numeral";

const TransferRow = ({ hash, from, to, amount, time }) => (
  <Table.Row bg={{ base: "white", _dark: "#262626" }}>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
      <HelpLink href={TRANSACTION_DETAILS(hash)} value={hash} />
    </Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
      <HelpLink href={`/accounts/${ethToRealionetwork(from)}`} value={from} />
    </Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
      <HelpLink href={`/accounts/${ethToRealionetwork(to)}`} value={to} />
    </Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{numeral(amount).format('0.00')}</Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{dayjs.utc(time * 1000).fromNow()}</Table.Cell>
  </Table.Row>
);

const TransferTable = ({ data, page, setPage }) => {
  return (
    <VStack w="full">
      <Box w="full" overflowX="auto">
        <Table.Root color={{ base: "black", _dark: "white" }} showColumnBorder={false} h="full" w="full">
          <Table.Header>
            <Table.Row bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
              <Table.ColumnHeader>Hash</Table.ColumnHeader>
              <Table.ColumnHeader>From</Table.ColumnHeader>
              <Table.ColumnHeader>To</Table.ColumnHeader>
              <Table.ColumnHeader>
                Amount
              </Table.ColumnHeader>
              <Table.ColumnHeader>Time</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body bg={{ base: "white", _dark: "#262626" }}>
            {data?.loading ? (
              Array.from({ length: 10 }).map((_, index) => <SkeletonItem key={`transfer-skeleton-${index}`} />)
            ) : data?.data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} textAlign="center">
                  <Center py="5" px="8" minH="65vh" w="full" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                    <NoData />
                  </Center>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.data.map((item, index) => (
                <TransferRow key={`transfer-${index}`} hash={item.transaction.id} from={item.from.id} to={item.to.id} amount={item.value} time={item.timestamp} />
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
      <PaginationRoot
        count={data?.count}
        pageSize={20}
        value={page + 1}
        onPageChange={(e) => setPage(e.page - 1)}
        size={{ base: "xs", md: "lg" }}
      >
        <HStack gap={0}>
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
    </VStack>
  );
};

export const SkeletonItem = () => (
  <Table.Row>
    <Table.Cell py="26px"><Skeleton h="10px" w="full" /></Table.Cell>
    <Table.Cell py="26px"><Skeleton h="10px" w="full" /></Table.Cell>
    <Table.Cell py="26px"><Skeleton h="10px" w="full" /></Table.Cell>
    <Table.Cell py="26px"><Skeleton h="10px" w="full" /></Table.Cell>
    <Table.Cell py="26px"><Skeleton h="10px" w="full" /></Table.Cell>
  </Table.Row>
);

export default TransferTable;
