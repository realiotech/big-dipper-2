import { Flex, GridItem, Link as ChakraLink, Text, Table, For } from "@chakra-ui/react"
import { useTransactions } from "./hooks"
import Link from "next/link"
import numeral from "numeral"
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis"
import dayjs from '@/utils/dayjs';
import { Status } from "@/components/ui/status"
import Loading from "@/components/helper/loading"

const Transactions = () => {
    const { state } = useTransactions();
    if (!state?.items?.length) return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
            <Loading />
        </GridItem>
    )

    return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
            <Flex w='full' justifyContent={'space-between'} pb='4'>
                <Text fontSize='24px' fontWeight={400}>
                    Latest Transactions
                </Text>
                <ChakraLink asChild colorPalette={'blue'}>
                    <Link href='/transactions'>See more</Link>
                </ChakraLink>
            </Flex>
            <Table.Root bgColor='inherit' showColumnBorder={false}>
                <Table.Header>
                    <Table.Row bgColor='inherit'>
                        <Table.ColumnHeader>
                            Block
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Hash
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Result
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Time
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <For each={state.items}>
                        {(item, index) => (
                            <Table.Row key={`transaction-${index}`}>
                                <Table.Cell>
                                    <ChakraLink asChild colorPalette='blue'>
                                        <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
                                    </ChakraLink>
                                </Table.Cell>
                                <Table.Cell>
                                    <ChakraLink asChild colorPalette='blue'>
                                        <Link href={`/transactions/${item.hash}`}>{getMiddleEllipsis(item.hash, { beginning: 15, ending: 5 })}</Link>
                                    </ChakraLink>
                                </Table.Cell>
                                <Table.Cell><Status value={item.success ? "success" : "error"}><Text>{item.success ? "Success" : "Failed"}</Text></Status></Table.Cell>
                                <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
                            </Table.Row>
                        )}
                    </For>
                </Table.Body>
            </Table.Root>
        </GridItem>
    )
}

export default Transactions;