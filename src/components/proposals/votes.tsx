import { useMemo } from "react";
import {
  Box,
  Text,
  Table,
  HStack,
  Flex,
  Tabs,
  Grid,
  Center,
  Stack,
  useBreakpointValue,
  StackSeparator,
  Show,
} from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useVotes } from "./hooks";
import numeral from "numeral";
import Big from "big.js";
import useShallowMemo from "@/hooks/useShallowMemo";
import { usePagination } from "@/hooks/use_pagination";
import { filterDataByTab, getVoteKey } from "./utils";
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination";
import { useProfileRecoil } from "@/recoil/profiles";
import Proposer from "../helper/proposer";
import NoData from "../helper/nodata";

const VoteItemMobile = ({ vote }) => {
  const { name, address, imageUrl } = useProfileRecoil(vote.user);
  return (
    <Flex py={3} direction={'column'} gap={3}>
      <Flex direction={'column'} gap={1}>
        <Text>Validator</Text>
        <Proposer name={name} address={address} image={imageUrl} />
      </Flex>
      <Flex direction={'column'} gap={1}>
        <Text>Vote</Text>
        <Text>{getVoteKey(vote.vote)}</Text>
      </Flex>
    </Flex>
  );
};

const VoteItem = ({ vote }) => {
  const { name, address, imageUrl } = useProfileRecoil(vote.user);
  return (
    <Table.Row>
      <Table.Cell>
        <Proposer name={name} address={address} image={imageUrl} />
      </Table.Cell>
      <Table.Cell>{getVoteKey(vote.vote)}</Table.Cell>
    </Table.Row>
  );
};

export default function VotesTable() {
  const { page, handlePageChange, sliceItems, resetPagination } = usePagination(
    {}
  );
  const { state, handleTabChange } = useVotes(resetPagination);
  const filteredItemsMemo = useShallowMemo(
    filterDataByTab({
      tab: state.tab,
      data: state.data,
      notVoted: state.validatorsNotVoted,
    })
  );
  const items = useMemo(
    () => sliceItems(filteredItemsMemo),
    [filteredItemsMemo, sliceItems]
  );
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <>
      <Flex
        direction={{ base: "column", md: "row" }}
        w="full"
        justifyContent={"space-between"}
        align={"center"}
        py={4}
      >
        <Tabs.Root
          value={state?.tab + 1}
          variant="plain"
          onValueChange={(e) => handleTabChange(e, e.value - 1)}
        >
          <Tabs.List w="full" bg={{ base: "white", _dark: "black" }} rounded="l3" p="1">
            <Grid
              templateColumns={{ base: "repeat(3, 1fr)", md: "repeat(6, 1fr)" }}
              w={{ base: "90vw", md: "full" }}
            >
              <Tabs.Trigger
                value={1}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <Center w={"full"}>All</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={2}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <Center w={"full"}>Yes</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={3}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <Center w={"full"}>No</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={4}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <Center w={"full"}>Veto</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={5}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
              >
                <Center w={"full"}>Abstain</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
                value={6}
              >
                <Center w={"full"}>Did not vote</Center>
              </Tabs.Trigger>
              {/* <Tabs.Indicator rounded="l2" /> */}
            </Grid>
          </Tabs.List>
        </Tabs.Root>
      </Flex>
      <Box bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py={6} px={3} borderRadius="md" boxShadow="sm">
        { items?.length ? isMobile ? (
          <Stack borderRadius={'2xl'} overflowY={'auto'} separator={<StackSeparator/>} bg={{ base: "white", _dark: "black" }} py={4} px={6} mb={3}>
            {items.map((item, index) => (
              <VoteItemMobile vote={item} key={`vote-${index}`} />
            ))}
          </Stack>
        ) : (
          <Table.Root  color={{ base: "black", _dark: "white" }} >
            <Table.Header>
              {isMobile ? (
                <></>
              ) : (
                <Table.Row  bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}>
                  <Table.ColumnHeader>Block</Table.ColumnHeader>
                  <Table.ColumnHeader>Vote</Table.ColumnHeader>
                </Table.Row>
              )}
            </Table.Header>
            <Table.Body bg={{ base: "white", _dark: "#262626" }}>
              {items?.length &&
                items.map((item, index) => (
                  <VoteItem vote={item} key={`vote-${index}`} />
                ))}
            </Table.Body>
          </Table.Root >
        ) : <NoData />}
        <Show when={state?.data?.length > 10}>
          <PaginationRoot
            count={state.data.length}
            pageSize={10}
            page={page + 1}
            onPageChange={(e) => handlePageChange(e, e.page - 1)}
            marginTop={'10px'}
          >
            <HStack wrap="wrap">
              <PaginationPrevTrigger />
              <PaginationItems />
              <PaginationNextTrigger />
            </HStack>
          </PaginationRoot>
        </Show>
      </Box>
    </>
  );
}
