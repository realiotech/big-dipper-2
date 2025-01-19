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

const getDisplayHeaders = (displayMode) => {
    if (displayMode === 1) return <Table.ColumnHeader>Address</Table.ColumnHeader>
    if (displayMode === 2) return <Table.ColumnHeader>Validator</Table.ColumnHeader>
    return (
        <>
            <Table.ColumnHeader>Address</Table.ColumnHeader>
            <Table.ColumnHeader>Validator</Table.ColumnHeader>
        </>
    )
}

const getDisplayData = (displayMode, staker_addr, val_addr) => {
    if (displayMode === 1) return <Table.Cell>
        <HelpLink href={ADDRESS_DETAILS(staker_addr)} value={staker_addr} />
    </Table.Cell>
    if (displayMode === 2) return <Table.Cell>
        <HelpLink href={ADDRESS_DETAILS(val_addr)} value={val_addr} />
    </Table.Cell>
    return (
        <>
            <Table.Cell>
                <HelpLink href={ADDRESS_DETAILS(staker_addr)} value={staker_addr} />
            </Table.Cell>
            <Table.Cell>
                <HelpLink href={ADDRESS_DETAILS(val_addr)} value={val_addr} />
            </Table.Cell>
        </>
    )
}

const UndelegationItem = ({ item, asset, displayMode }) => {
    const assetDetail = useRecoilValue(readAsset(asset))
    return (
        <Table.Row>
            {getDisplayData(displayMode, item.staker_addr, item.val_addr)}
            <Table.Cell>
                <HelpLink href={BLOCK_DETAILS(item.creation_height)} value={numeral(item.creation_height).format('0,0')} />
            </Table.Cell>
            <Table.Cell>{numeral(item.bond_weight).format('0.0')}</Table.Cell>
            <Table.Cell>
                {numeral(formatTokenByExponent(item.amount, assetDetail?.decimals)).format('0,0.00')} {" "}
            </Table.Cell>
            <Table.Cell>
                <Asset name={assetDetail?.symbol} image={assetDetail?.image} denom={assetDetail?.denom} />
            </Table.Cell>
        </Table.Row>
    )
}

export default function Undelegations({ data, displayMode, page, setPage }) {
    return (
        <VStack>
            <Table.Root showColumnBorder={false} h="full" w="full">
                <Table.Header>
                    <Table.Row bg="#FAFBFC">
                        {getDisplayHeaders(displayMode)}
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
                        ) : data.data.map((item, index) => <UndelegationItem item={item} key={`undelegation-${index}`} asset={item?.denom} displayMode={displayMode}/>)
                            : (
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