import React from "react";
import {
  Table,
  VStack,
  Box,
  Center,
  HStack,
} from "@chakra-ui/react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { Skeleton } from "../ui/skeleton";
import NoData from "../helper/nodata";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../ui/pagination";

const MintRow = ({ address, to, amount }) => (
  <Table.Row bg={{ base: "white", _dark: "#262626" }}>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{address}</Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{to}</Table.Cell>
    <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{amount}</Table.Cell>
  </Table.Row>
);

const MintTable = ({ data, page, setPage, sort, setSort }) => {
  const handleSort = () => setSort(sort === 'asc' ? 'desc' : 'asc');

  return (
    <VStack w="full">
      <Box w="full" overflowX="auto">
        <Table.Root color={{ base: "black", _dark: "white" }} showColumnBorder={false} h="full" w="full">
          <Table.Header>
            <Table.Row bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
              <Table.ColumnHeader>Hash</Table.ColumnHeader>
              <Table.ColumnHeader>To</Table.ColumnHeader>
              <Table.ColumnHeader onClick={handleSort}>
                Amount {sort === 'asc' ? <FaCaretUp /> : <FaCaretDown />}
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body bg={{ base: "white", _dark: "#262626" }}>
            {data?.loading ? (
              Array.from({ length: 10 }).map((_, index) => <SkeletonItem key={`mint-skeleton-${index}`} />)
            ) : data?.data.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={3} textAlign="center">
                  <Center py="5" px="8" minH="65vh" w="full" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                    <NoData />
                  </Center>
                </Table.Cell>
              </Table.Row>
            ) : (
              data.data.map((item, index) => (
                <MintRow key={`mint-${index}`} address={item.from} to={item.to} amount={item.amount} />
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Box>
      <PaginationRoot
        count={data?.count}
        pageSize={10}
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
  </Table.Row>
);

export default MintTable;