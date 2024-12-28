import { Box, Center, Text, Table, Link as ChakraLink, For } from "@chakra-ui/react";
import { useBlocks } from "./hooks";
import Link from "next/link";
import Proposer from "../helper/proposer";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { Skeleton } from "../ui/skeleton";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import { Button } from "../ui/button";
import HelpLink from "../helper/help_link";

const BlockItem = ({ item, rowIndex, isItemLoaded }) => {
    const { name, address, imageUrl } = useProfileRecoil(item.proposer);

    if (!isItemLoaded(rowIndex)) {
        return (
            <Table.Row key={`block-${rowIndex}`}>
                <Skeleton />
            </Table.Row>
        );
    } else {
        return (
            <Table.Row key={`block-${rowIndex}`}>
                <Table.Cell>
                    <HelpLink href={`/blocks/${item.height}`} value={numeral(item.height).format("0,0")} />
                </Table.Cell>
                <Table.Cell><Proposer address={address} image={imageUrl} name={name} /></Table.Cell>
                <Table.Cell>{getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}</Table.Cell>
                <Table.Cell>{numeral(item.txs).format("0,0")}</Table.Cell>
                <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
            </Table.Row>
        );
    }
};

export function BlockList() {
    const { state, isItemLoaded, loadMoreItems } = useBlocks();

    if (!state?.items?.length) {
        return (
            <Center borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="65vh" w="full">
                <Text>Nothing to show</Text>
            </Center>
        );
    }

    return (
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="85vh" w="full">
            <Table.Root bgColor="inherit" showColumnBorder={false} h="full" w='full'>
                <Table.Header>
                    <Table.Row bgColor="inherit">
                        <Table.ColumnHeader>Height</Table.ColumnHeader>
                        <Table.ColumnHeader>Proposer</Table.ColumnHeader>
                        <Table.ColumnHeader>Hash</Table.ColumnHeader>
                        <Table.ColumnHeader>Txs</Table.ColumnHeader>
                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body >
                    <For each={state.items}>
                        {(item, index) => (
                            <BlockItem item={item} rowIndex={index} isItemLoaded={isItemLoaded} />
                        )}
                    </For>
                </Table.Body>
            </Table.Root>
            <Center w='full' py='4'><Button variant={'plain'} onClick={() => loadMoreItems()}>Load more</Button></Center>
        </Box>
    );
}
