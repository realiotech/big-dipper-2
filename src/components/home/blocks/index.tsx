import { Flex, GridItem, Link as ChakraLink, Text, Table, For } from "@chakra-ui/react"
import { useBlocks } from "./hooks"
import Link from "next/link"
import { Skeleton } from "@src/components/ui/skeleton"
import numeral from "numeral"

const Blocks = () => {
    const { state } = useBlocks()

    return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
            <Flex w='full' justifyContent={'space-between'}>
                <Text fontSize='24px' pb='6' fontWeight={400}>
                    Latest Blocks
                </Text>
                <ChakraLink asChild>
                    <Link href='/blocks'>See more</Link>
                </ChakraLink>
            </Flex>
            <Table.Root variant={'line'} bgColor='inherit' color={'black'}>
                <Table.Header>
                    <Table.Row bgColor='inherit' color={'black'}>
                        <Table.ColumnHeader>
                            Height
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Proposer
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Hash
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Txs
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                            Time
                        </Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    { state.items.length ? (
                        <For each={state.items}>
                            {(item, index) => (
                                <Table.Row key={`block-${index}`}>
                                    <Table.Cell>
                                        <ChakraLink asChild>
                                            <Link href={`/blocks/${item.height}`} color={'#1D86FF'}>{numeral(item.height).format('0,0')}</Link>
                                        </ChakraLink>
                                    </Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell></Table.Cell>
                                    <Table.Cell>{numeral(item.txs).format('0,0')}</Table.Cell>
                                    <Table.Cell></Table.Cell>
                                </Table.Row>
                            )}
                        </For>
                    ) : <Skeleton h={'200px'}/> }
                </Table.Body>
            </Table.Root>
        </GridItem>
    )
}

export default Blocks;