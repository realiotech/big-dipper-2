import { Flex, GridItem, Link as ChakraLink, Text, Table, For } from "@chakra-ui/react"
import { useBlocks } from "./hooks"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import numeral from "numeral"
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis"
import dayjs from '@/utils/dayjs';
import Proposer from "@/components/helper/proposer"
import { useProfileRecoil } from "@/recoil/profiles/hooks"
import NoData from "@/components/helper/nodata"
import Loading from "@/components/helper/loading"

const BlockItem = ({ item }) => {
    const { name, address, imageUrl } = useProfileRecoil(item.proposer);

    return (
        <Table.Row>
            <Table.Cell>
                <ChakraLink asChild colorPalette='blue'>
                    <Link href={`/blocks/${item.height}`}>{numeral(item.height).format('0,0')}</Link>
                </ChakraLink>
            </Table.Cell>
            <Table.Cell><Proposer address={address} image={imageUrl} name={name} /></Table.Cell>
            <Table.Cell>{getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}</Table.Cell>
            <Table.Cell>{numeral(item.txs).format('0,0')}</Table.Cell>
            <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
        </Table.Row>
    )
}

const Blocks = () => {
    const { state } = useBlocks()

    if (state.loading) return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
            <Loading />
        </GridItem>
    )

    return (
        <GridItem borderRadius='20px' bgColor='#F6F7F8' py='5' px='8' colSpan={2}>
            <Flex w='full' justifyContent={'space-between'} pb='4'>
                <Text fontSize='24px' fontWeight={400}>
                    Latest Blocks
                </Text>
                <ChakraLink asChild colorPalette={'blue'}>
                    <Link href='/blocks'>See more</Link>
                </ChakraLink>
            </Flex>
            {state.items.length ? (
                <Table.Root bgColor='inherit' size='sm' showColumnBorder={false}>
                    <Table.Header>
                        <Table.Row bgColor='inherit'>
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
                        <For each={state.items}>
                            {(item, index) => (
                                <BlockItem key={`block-${index}`} item={item} />
                            )}
                        </For>
                    </Table.Body>
                </Table.Root>
            ) : <NoData />}
        </GridItem>
    )
}

export default Blocks;