import {
  Box,
  Table,
  Center,
  Skeleton,
  HStack,
  Button,
} from "@chakra-ui/react";
import HelpLink from "../helper/help_link";
import numeral from "numeral";
import { useHolders } from "./hooks";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "../ui/pagination";
import NoData from "../helper/nodata";
import { ethToRealionetwork } from "@realiotech/address-generator";
import { useRecoilValue } from "recoil";
import { readToken } from "@/recoil/erc20";
import Erc20 from "../helper/erc20";

const HolderItem = ({ item, metadata }) => {
  if (!item.account) return <></>
  return (
    <Table.Row bg={{ base: "white", _dark: "#262626" }}>
      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        <HelpLink href={`/accounts/${ethToRealionetwork(item.account.id)}`} value={item.account.id} />
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        {numeral(
          item.value
        ).format("0,0.00")}
      </Table.Cell>
      <Table.Cell borderBottomColor={{ base: "gray.200", _dark: "gray.700" }}>
        <Erc20
          name={metadata?.symbol}
          image={metadata?.image}
          address={metadata?.address}
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

export default function Holders({ address }) {
  const { holderState, page, setPage } = useHolders(address);
  const erc20Detail = useRecoilValue(readToken(address));

  return (
    <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} overflow={"auto"} p={6}>
      <Table.Root color={{ base: "black", _dark: "white" }}>
        <Table.Header bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
          <Table.Row bgColor="inherit">
            <Table.ColumnHeader>Address</Table.ColumnHeader>
            <Table.ColumnHeader>
              <Button
                variant="plain"
                w="full"
                textAlign={"left"}
                p={0}
                justifyContent={"left"}
              >
                Amount
              </Button>
            </Table.ColumnHeader>
            <Table.ColumnHeader>Token</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body bg={{ base: "white", _dark: "#262626" }}>
          {!holderState.loading ? (
            holderState.data.length > 0 ? (
              holderState.data.map((item, index) => (
                <HolderItem item={item} key={`holder-${index}`} metadata={erc20Detail} />
              ))
            ) : (
              <Table.Row>
                <Table.Cell colSpan={3} textAlign="center">
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
            )
          ) : (
            Array.from({ length: 20 }).map((_, index) => (
              <SkeletonBlockItem key={`skeleton-${index}`} index={index} />
            ))
          )}
        </Table.Body>
      </Table.Root>
      <Center w="full" py="4">
        <PaginationRoot
          count={holderState.count}
          pageSize={10}
          value={page + 1}
          onPageChange={(e) => setPage(e.page)}
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
  );
}
