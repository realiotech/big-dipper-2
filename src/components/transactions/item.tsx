import { Text, Table, Link as ChakraLink, Skeleton } from "@chakra-ui/react";
import Link from "next/link";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Status } from "../ui/status";

export const TxItem = ({ item, rowIndex }) => {
  return (
    <Table.Row maxH={'45px'} bg={{ base: "white", _dark: "#262626" }} key={`transaction-${rowIndex}`}>
      <Table.Cell lineHeight={1} borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} >
        <ChakraLink asChild colorPalette='blue'>
          <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
        </ChakraLink>
      </Table.Cell>
      <Table.Cell lineHeight={1} borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <ChakraLink asChild colorPalette='blue'>
          <Link href={`/transactions/${item.hash}`}>{item.hash}</Link>
        </ChakraLink>
      </Table.Cell>
      <Table.Cell lineHeight={1} borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{numeral(item.messages.count).format('0,0')}</Table.Cell>
      <Table.Cell lineHeight={1}borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}><Status value={item.success ? "success" : "error"}><Text>{item.success ? "Success" : "Failed"}</Text></Status></Table.Cell>
      <Table.Cell lineHeight={1} borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
    </Table.Row>
  );
};

export const SkeletonTxItem = ({ index }) => {
  return (
    <Table.Row bg={{ base: "white", _dark: "#262626" }} key={`transaction-${index}`}>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} py={3}>
        <Skeleton h="20px" bg={{ base: "gray.200", _dark: "#4f4f4fff" }}  w="60%" />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} py={3}>
        <Skeleton h="20px" bg={{ base: "gray.200", _dark: "#4f4f4fff" }}  w="full" />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} py={3}>
        <Skeleton h="20px" bg={{ base: "gray.200", _dark: "#4f4f4fff" }}  w="40%" />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} py={3}>
        <Skeleton h="20px" bg={{ base: "gray.200", _dark: "#4f4f4fff" }}  w="50%" />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} py={3}>
        <Skeleton h="20px" bg={{ base: "gray.200", _dark: "#4f4f4fff" }}  w="70%" />
      </Table.Cell>
    </Table.Row>
  )
}
