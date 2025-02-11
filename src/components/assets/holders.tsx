import {
    Box,
    Text,
    Table,
    Center,
    Skeleton,
    HStack,
    Button,
} from "@chakra-ui/react";
import HelpLink from "../helper/help_link";
import Asset from "../helper/asset";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import numeral from "numeral";
import { formatTokenByExponent } from "@/utils";
import { useHolders } from "./hooks";
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "../ui/pagination";
import { useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const HolderItem = ({ item, denom }) => {
    const assetDetail = useRecoilValue(readAsset(denom));
    return (
        <Table.Row bg={{ base: "white", _dark: "#262626" }}>
            <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
                <HelpLink href={`/accounts/${item.address}`} value={item.address} />
            </Table.Cell>
            <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
                {numeral(formatTokenByExponent(item.amount, assetDetail?.decimals)).format("0,0.00")}
            </Table.Cell>
            <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
                <Asset
                    name={assetDetail?.symbol}
                    image={assetDetail?.image}
                    denom={assetDetail?.denom}
                />
            </Table.Cell>
        </Table.Row>
    );
};

const SkeletonBlockItem = ({ index }) => {
    return (
        <Table.Row key={`transaction-${index}`}>
            <Table.Cell
                w="50%"
                borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}
            >
                <Skeleton h={"10px"} w="full" mb="2" />
            </Table.Cell>
            <Table.Cell
                w="40%"
                borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}
            >
                <Skeleton h={"10px"} w="full" mb="2" />
            </Table.Cell>
            <Table.Cell
                w="10%"
                borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}
            >
                <Skeleton columnFill={"3"} h={"10px"} w="full" mb="2" />
            </Table.Cell>
        </Table.Row>
    );
};
export default function Holders({ denom }) {
    const { holderState, page, setPage, handleSort, sortDirection } = useHolders(denom);
    const [sortingKey, setSortingKey] = useState('')
    const handleSortWithKey = (key) => {
        setSortingKey(key)
        handleSort(sortDirection == 'asc' ? 'desc' : 'asc')
    }
    return (
        <Box
            bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
            overflow={"auto"}
            p={6}
        >
            <Table.Root color={{ base: "black", _dark: "white" }}>
                <Table.Header bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                    <Table.Row bgColor="inherit">
                        <Table.ColumnHeader>Address</Table.ColumnHeader>
                        <Table.ColumnHeader onClick={() => handleSortWithKey('amount')}>
                            <Button variant='plain' w='full' textAlign={'left'} p={0} justifyContent={'left'}>
                                Amount {sortingKey == 'amount' ?
                                    sortDirection == 'asc' ? <FaCaretUp /> : <FaCaretDown /> : ''
                                }
                            </Button>
                        </Table.ColumnHeader>                        
                    <Table.ColumnHeader>Denom</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body bg={{ base: "white", _dark: "#262626" }}>
                    {!holderState.loading ? (
                        holderState.data.length > 0 ? (
                            holderState.data.map((item, index) => (
                                <HolderItem
                                    item={item}
                                    denom={denom}
                                    key={`holder-${index}`}
                                />
                            ))
                        ) : (
                            <Center
                                borderRadius="20px"
                                bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
                                py="5"
                                px="8"
                                minH="65vh"
                                w="full"
                            >
                                <Text>Nothing to show</Text>
                            </Center>

                        )
                    ) : (
                        Array.from({ length: 20 }).map((_, index) => (
                            <SkeletonBlockItem
                                key={`skeleton-${index}`}
                                index={index}
                            />
                        ))
                    )}
                </Table.Body>
            </Table.Root>
            <Center w="full" py="4">
                <PaginationRoot
                    count={holderState?.count}
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
            </Center>
        </Box>
    )
}