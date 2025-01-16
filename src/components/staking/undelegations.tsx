import React from "react";
import {
    Table,
    For,
    Center,
    VStack,
    HStack,
} from "@chakra-ui/react";
import numeral from "numeral";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import NoData from "../helper/nodata";
import { Skeleton } from "../ui/skeleton";
import HelpLink from "../helper/help_link";
import { ADDRESS_DETAILS, BLOCK_DETAILS, formatTokenByExponent } from "@/utils";
import Asset from "../helper/asset";
import { PaginationItems, PaginationNextTrigger, PaginationPrevTrigger, PaginationRoot } from "../ui/pagination";

const UndelegationItem = ({ item, asset }) => {
    return (
        <Table.Row>
            <Table.Cell>
                <HelpLink href={ADDRESS_DETAILS(item.staker_addr)} value={item.staker_addr} />
            </Table.Cell>
            <Table.Cell>
                <HelpLink href={BLOCK_DETAILS(item.creation_height)} value={numeral(item.creation_height).format('0,0')} />
            </Table.Cell>
            <Table.Cell>{numeral(item.bond_weight).format('0.0')}</Table.Cell>
            <Table.Cell>
                {numeral(formatTokenByExponent(item.amount, asset?.decimals)).format('0,0.00')} {" "}
            </Table.Cell>
            <Table.Cell>
                <Asset name={asset?.symbol} image={asset?.image} denom={asset?.denom} />
            </Table.Cell>
        </Table.Row>
    )
}

export default function Undelegations({ data, asset, page, setPage }) {
    const assetDetail = useRecoilValue(readAsset(asset))
    return (
        <VStack>
            <Table.Root showColumnBorder={false} h="full" w="full">
                <Table.Header>
                    <Table.Row bg="#FAFBFC">
                        <Table.ColumnHeader>Address</Table.ColumnHeader>
                        <Table.ColumnHeader>Creation Height</Table.ColumnHeader>
                        <Table.ColumnHeader>Bond Weight</Table.ColumnHeader>
                        <Table.ColumnHeader>Amount</Table.ColumnHeader>
                        <Table.ColumnHeader />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        !data?.loading ? data?.data.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={5} textAlign="center">
                                    <Center borderRadius="20px" bgColor="#FAFBFC" py="5" px="8" minH="65vh" w="full">
                                        <NoData />
                                    </Center>
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            <For each={data.data}>
                                {(item, index) => <UndelegationItem item={item} key={`undelegation-${index}`} asset={assetDetail} />}
                            </For>
                        ) : (
                            Array.from({ length: 10 }).map((_, index) => (
                                <SkeletonItem
                                    index={index}
                                />
                            ))
                        )
                    }
                </Table.Body>
            </Table.Root>
            <PaginationRoot
                count={data?.count}
                pageSize={10}
                value={page + 1}
                onPageChange={(e) => setPage(e.page - 1)}
            >
                <HStack>
                    <PaginationPrevTrigger />
                    <PaginationItems />
                    <PaginationNextTrigger />
                </HStack>
            </PaginationRoot>
        </VStack>
    )
}

export const SkeletonItem = ({ index }) => {
    return (
        <Table.Row key={`transaction-${index}`}>
            <Table.Cell py='26px'>
                <Skeleton h={"10px"} w="full" />
            </Table.Cell >
            <Table.Cell py='26px'>
                <Skeleton h={"10px"} w="full" />
            </Table.Cell>
            <Table.Cell py='26px'>
                <Skeleton h={"10px"} w="full" />
            </Table.Cell>
            <Table.Cell py='26px'>
                <Skeleton h={"10px"} w="full" />
            </Table.Cell>
            <Table.Cell py='26px'>
                <Skeleton h={"10px"} w="full" />
            </Table.Cell>
        </Table.Row>
    )
}