import React, { useState } from "react";
import { Table, Button, Center, VStack, HStack, Box } from "@chakra-ui/react";
import numeral from "numeral";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";
import NoData from "../helper/nodata";
import { Skeleton } from "../ui/skeleton";
import HelpLink from "../helper/help_link";
import { ADDRESS_DETAILS, BLOCK_DETAILS, formatTokenByExponent } from "@/utils";
import Asset from "../helper/asset";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../ui/pagination";
import Proposer from "../helper/proposer";
import { useProfileRecoil } from "@/recoil/profiles";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

const getDisplayHeaders = (displayMode) => {
  if (displayMode === 1)
    return <Table.ColumnHeader>Address</Table.ColumnHeader>;
  if (displayMode === 2)
    return <Table.ColumnHeader>Validator</Table.ColumnHeader>;
  return (
    <>
      <Table.ColumnHeader>Address</Table.ColumnHeader>
      <Table.ColumnHeader>Validator</Table.ColumnHeader>
    </>
  );
};

const getDisplayData = (displayMode, staker_addr, name, address, imageUrl) => {
  if (displayMode === 1)
    return (
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <HelpLink href={ADDRESS_DETAILS(staker_addr)} value={staker_addr} />
      </Table.Cell>
    );
  if (displayMode === 2)
    return (
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <Proposer name={name} address={address} image={imageUrl} />
      </Table.Cell>
    );
  return (
    <>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <HelpLink href={ADDRESS_DETAILS(staker_addr)} value={staker_addr} />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <Proposer name={name} address={address} image={imageUrl} />
      </Table.Cell>
    </>
  );
};

const UndelegationItem = ({ item, asset, displayMode }) => {
  const assetDetail = useRecoilValue(readAsset(asset));
  const { name, address, imageUrl } = useProfileRecoil(item?.val_addr)

  return (
    <Table.Row bg={{ base: "white", _dark: "#262626" }}>
      {getDisplayData(displayMode, item.staker_addr, name, address, imageUrl)}
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} display={{ base: "none", md: "table-cell" }}>
        <HelpLink
          href={BLOCK_DETAILS(item.creation_height)}
          value={numeral(item.creation_height).format("0,0")}
        />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }} display={{ base: "none", lg: "table-cell" }}>
        {numeral(item.bond_weight).format("0.0")}
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        {numeral(
          formatTokenByExponent(item.amount, assetDetail?.decimals)
        ).format("0,0.00")}{" "}
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: 'gray.200', _dark: 'gray.700' }}>
        <Asset
          name={assetDetail?.symbol}
          image={assetDetail?.image}
          denom={assetDetail?.denom}
        />
      </Table.Cell>
    </Table.Row>
  );
};

export default function Undelegations({ data, page, setPage, displayMode, handleSort, sort }) {
  const [sortingKey, setSortingKey] = useState('')

  const handleSortWithKey = (key) => {
    setSortingKey(key)
    handleSort(sort == 'asc' ? 'desc' : 'asc')
  }
  return (
    <VStack w={"full"} overflowX={"auto"}>
      <Box w="full" overflowX="auto">
        <Table.Root color={{ base: "black", _dark: "white" }} showColumnBorder={false} h="full" w="full">
          <Table.Header>
            <Table.Row bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
              {getDisplayHeaders(displayMode)}
              <Table.ColumnHeader display={{ base: "none", md: "table-cell" }}>
                Creation Height
              </Table.ColumnHeader>
              <Table.ColumnHeader display={{ base: "none", lg: "table-cell" }}>
                Bond Weight
              </Table.ColumnHeader>
              <Table.ColumnHeader onClick={() => handleSortWithKey('amount')}>
                <Button variant='plain' w='full' textAlign={'left'} p={0} justifyContent={'left'}>
                  Amount {sortingKey == 'amount' ?
                    sort == 'asc' ? <FaCaretUp /> : <FaCaretDown /> : ''
                  }
                </Button>
              </Table.ColumnHeader>
              <Table.ColumnHeader />
            </Table.Row>
          </Table.Header>
          <Table.Body bg={{ base: "white", _dark: "#262626" }}>
            {!data?.loading ? (
              !data?.data || data?.data.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center">
                    <Center
                      borderRadius="20px"
                      bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
                      py="5"
                      px="8"
                      minH="65vh"
                      w="full"
                    >
                      <NoData />
                    </Center>
                  </Table.Cell>
                </Table.Row>
              ) : (
                data.data.map((item, index) => (
                  <UndelegationItem
                    item={item}
                    key={`undelegation-${index}`}
                    asset={item?.denom}
                    displayMode={displayMode}
                  />
                ))
              )
            ) : (
              Array.from({ length: 10 }).map((_, index) => (
                <SkeletonItem key={`undelegation-skele-${index}`} index={index} />
              ))
            )}
          </Table.Body>
        </Table.Root >
      </Box>
      <PaginationRoot
        count={data?.count}
        pageSize={10}
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
    </VStack>
  );
}

export const SkeletonItem = ({ index }) => {
  return (
    <Table.Row key={`transaction-${index}`}>
      <Table.Cell py="26px">
        <Skeleton h={"10px"} w="full" />
      </Table.Cell>
      <Table.Cell py="26px">
        <Skeleton h={"10px"} w="full" />
      </Table.Cell>
      <Table.Cell py="26px">
        <Skeleton h={"10px"} w="full" />
      </Table.Cell>
      <Table.Cell display={{ base: "none", md: "table-cell" }} py="26px">
        <Skeleton h={"10px"} w="full" />
      </Table.Cell>
      <Table.Cell display={{ base: "none", lg: "table-cell" }} py="26px">
        <Skeleton h={"10px"} w="full" />
      </Table.Cell>
    </Table.Row>
  );
};
