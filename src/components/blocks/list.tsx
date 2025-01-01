import { Box, Center, Text, Table, For, HStack, Flex } from "@chakra-ui/react";
import { PaginationRoot, PaginationItems, PaginationPrevTrigger, PaginationNextTrigger } from "@/components/ui/pagination";
import { useBlocks } from "./hooks";
import Proposer from "../helper/proposer";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import numeral from "numeral";
import dayjs from "@/utils/dayjs";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import { usePagination } from "@/hooks/use_pagination";
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
    const { state, isItemLoaded } = useBlocks();
    const {
        page,
        rowsPerPage,
        handlePageChange,
        sliceItems,
    } = usePagination({
        initialRowsPerPage: 10,
        initialPage: 0,
    });

    if (!state?.items?.length) {
        return (
            <Center borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="65vh" w="full">
                <Text>Nothing to show</Text>
            </Center>
        );
    }

    const paginatedItems = sliceItems(state.items);

    return (
        <Box borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" minH="85vh" w="full">
            <Table.Root bgColor="inherit" showColumnBorder={false}>
                <Table.Header>
                    <Table.Row bgColor="inherit">
                        <Table.ColumnHeader>Height</Table.ColumnHeader>
                        <Table.ColumnHeader>Proposer</Table.ColumnHeader>
                        <Table.ColumnHeader>Hash</Table.ColumnHeader>
                        <Table.ColumnHeader>Txs</Table.ColumnHeader>
                        <Table.ColumnHeader>Time</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <For each={paginatedItems}>
                        {(item, index) => (
                            <BlockItem 
                                key={item.height} 
                                item={item} 
                                rowIndex={index} 
                                isItemLoaded={isItemLoaded} 
                            />
                        )}
                    </For>
                </Table.Body>
            </Table.Root>
            <Flex justify="center" mt={4}>
                <PaginationRoot 
                    count={state.items.length} 
                    pageSize={rowsPerPage} 
                    page={page + 1} 
                    onPageChange={(e) => handlePageChange(e, e.page - 1)}
                >
                    <HStack spacing={2}>
                        <PaginationPrevTrigger />
                        <PaginationItems />
                        <PaginationNextTrigger />
                    </HStack>
                </PaginationRoot>
            </Flex>
        </Box>
    );
}