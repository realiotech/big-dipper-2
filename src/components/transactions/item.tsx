import { Text, Table, Link as ChakraLink } from "@chakra-ui/react";
import Link from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Status } from "../ui/status";

const TxItem = ({ item, rowIndex }) => {
    return (
        <Table.Row key={`transaction-${rowIndex}`}>
            <Table.Cell>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/transactions/${item.hash}`}>{item.hash}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell>{numeral(item.messages.count).format('0,0')}</Table.Cell>
            <Table.Cell><Status value={item.success ? "success" : "error"}><Text>{item.success ? "Success" : "Failed"}</Text></Status></Table.Cell>
            <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
        </Table.Row>
    );
};


export default TxItem;