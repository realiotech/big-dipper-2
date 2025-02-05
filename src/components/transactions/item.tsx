import { Text, Table, Link as ChakraLink, Skeleton } from "@chakra-ui/react";
import Link from "next/link";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Status } from "../ui/status";

export const TxItem = ({ item, rowIndex }) => {
    return (
        <Table.Row bg={{ base: "white", _dark: "#262626" }} key={`transaction-${rowIndex}`}>
            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}} >
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/transactions/${item.hash}`}>{item.hash}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{numeral(item.messages.count).format('0,0')}</Table.Cell>
            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}><Status value={item.success ? "success" : "error"}><Text>{item.success ? "Success" : "Failed"}</Text></Status></Table.Cell>
            <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
        </Table.Row>
    );
};

export const SkeletonTxItem = ({ index }) => {
    return (
      <Table.Row key={`transaction-${index}`}>
        <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
          <Skeleton h={"10px"} w="full" mb="3" />
        </Table.Cell>
        <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
          <Skeleton h={"10px"} w="full" mb="3" />
        </Table.Cell>
        <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
          <Skeleton h={"10px"} w="full" mb="3" />
        </Table.Cell>
        <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
          <Skeleton h={"10px"} w="full" mb="3" />
        </Table.Cell>
        <Table.Cell borderBottomColor={{base: 'gray.200', _dark: 'gray.700'}}>
          <Skeleton h={"10px"} w="full" mb="3" />
        </Table.Cell>
      </Table.Row>
    )
  }
