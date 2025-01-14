import React, { useMemo } from "react";
import {
  Box,
  Text,
  Table,
  Button,
  Tabs,
  VStack,
  Skeleton,
  Link,
  useBreakpointValue,
  Flex,
  Center,
  Grid,
  StackSeparator,
} from "@chakra-ui/react";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress";
import { useValidators } from "./hooks";
import useShallowMemo from "@/hooks/useShallowMemo";
import { useProfilesRecoil } from "@/recoil/profiles";
import Proposer from "../helper/proposer";
import { ADDRESS_DETAILS, getValidatorStatus } from "@/utils";
import numeral from "numeral";
import { Status } from "../ui/status";
import useTranslation from "next-translate/useTranslation";
import NextLink from "next/link";
import SearchValidator from "./search";
import { fetchColumns } from "./utils";
import ColumnHeader from "./header";
import Asset from "../helper/asset";
import { readAsset } from "@/recoil/asset";
import { useRecoilValue } from "recoil";
import { DelegateDialog } from "./dialog";

const SkeletonValidatorItems = ({ rowCount = 30 }) => {
    return (
      <>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <SkeletonItem key={`skeleton-item-${rowIndex}`} />
        ))}
      </>
    );
  };

const ValidatorItemMobile = ({ item }) => {
  const { t } = useTranslation("validators");
  const status = getValidatorStatus(item.status, item.jailed, item.tombstoned);
  const percentDisplay =
    item.status === 3
      ? `${numeral(item.votingPowerPercent.toFixed(6)).format("0.[00]")}`
      : "0";
  const votingPower = numeral(item.votingPower).format("0,0");

  return (
    <Box
      bg="white"
      p={4}
      //   boxShadow="sm"
      w="full"
      mb={4}
    //   border="1px solid"
    //   borderColor="gray.200"
    >
      <VStack align="stretch">
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Validator</Text>
          <Proposer
            name={item.validator.name}
            address={item.validator.address}
            image={item.validator.imageUrl}
          />
        </Flex>
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Voting Power</Text>
          <Flex justify="space-between">
            <Text>{votingPower}</Text>
            <Text>{percentDisplay}%</Text>
          </Flex>
          <ProgressRoot
            shape={"full"}
            size="xs"
            w="100%"
            variant={"outline"}
            value={item.votingPowerPercent * 2}
            colorPalette={"purple.100"}
          >
            <ProgressBar />
          </ProgressRoot>
        </Flex>
        <Flex justify="space-between" mb={2}>
          <Flex direction={"column"} justify="space-between">
            <Text>Status</Text>
            <Status colorPalette={status.theme} color={status.theme}>
              {t(status.status)}
            </Status>
          </Flex>
          <Flex direction={"column"} justify="space-between">
            <Text>Commission</Text>
            <Text>{numeral(item.commission).format("0.[00]")}%</Text>
          </Flex>
        </Flex>
        <Button
          bg={"#707D8A"}
          size="sm"
          disabled={item.status !== 3}
          as={NextLink}
          href={ADDRESS_DETAILS(item.validator.address)}
        >
          Delegate
        </Button>
      </VStack>
    </Box>
  );
};

const SkeletonItem = () => {
  return (
    <Table.Row>
      <Table.Cell>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell w={"30%"}>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell textAlign={"right"}>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell textAlign={"left"} pl={6}>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
      <Table.Cell width={'10%'} textAlign="left">
        <Skeleton h={"20px"} w="full" mb="4" />
      </Table.Cell>
    </Table.Row>
  )
}

const ValidatorItem = ({ item, idx }) => {
  const { t } = useTranslation("validators");
  const asset = useRecoilValue(readAsset(item.denom))
  const status = getValidatorStatus(item.status, item.jailed, item.tombstoned);
  const percentDisplay =
    item.status === 3
      ? `${numeral(item.votingPowerPercent.toFixed(6)).format("0.[00]")}`
      : "0";
  const votingPower = numeral(item.votingPower).format("0,0");
  return (
    <Table.Row>
      <Table.Cell>#{idx + 1}</Table.Cell>
      <Table.Cell>
        <Proposer
          name={item.validator.name}
          address={item.validator.address}
          image={item.validator.imageUrl}
        />
      </Table.Cell>
      <Table.Cell>
        <Asset
          name={asset?.symbol}
          denom={asset?.denom}
          image={asset?.image}
        />
      </Table.Cell>
      <Table.Cell w={"30%"}>
        <Box>
          <Flex justify={"space-between"}>
            <Text>{votingPower}</Text>
            <Text>{percentDisplay}%</Text>
          </Flex>
          <ProgressRoot
            shape={"full"}
            h="50%"
            size="sm"
            w="100%"
            variant={"subtle"}
            value={item.votingPowerPercent * 2}
          >
            <ProgressBar />
          </ProgressRoot>
        </Box>
      </Table.Cell>
      <Table.Cell textAlign={"right"}>
        {numeral(item.commission).format("0.[00]")}%
      </Table.Cell>
      <Table.Cell textAlign={"left"} pl={6}>
        <Status colorPalette={status.theme} color={status.theme}>
          {t(status.status)}
        </Status>
      </Table.Cell>
      <Table.Cell textAlign="left">
        <Link asChild>
          {/* <NextLink href={ADDRESS_DETAILS(item?.validator.address)}> */}
            <Button bg={"#707D8A"} size="sm" disabled={item.status !== 3}>
              <DelegateDialog/>
            </Button>
          {/* </NextLink> */}
        </Link>
      </Table.Cell>
    </Table.Row>
  );
};

const ValidatorList = () => {
  const { t } = useTranslation("validators");
  const { state, handleTabChange, handleSearch, handleSort, sortItems } =
    useValidators();
  const validatorsMemo = useShallowMemo(state.items.map((x) => x.validator));
  const { profiles: dataProfiles } = useProfilesRecoil(validatorsMemo);
  const items = useMemo(
    () =>
      sortItems(
        state.items.map((x, i) => ({ ...x, validator: dataProfiles?.[i] }))
      ),
    [state.items, dataProfiles, sortItems]
  );
  const columns = fetchColumns(t);
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box minHeight="100vh">
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={3}
        justify={"space-between"}
        mb={4}
      >
        <Tabs.Root
          value={state?.tab + 1}
          variant="subtle"
          onValueChange={(e) => handleTabChange(e, e.value - 1)}
          size="lg"
        >
          <Tabs.List alignItems="center" justifyContent="center" gap={10}>
            <Grid gridTemplateColumns={"repeat(3, 1fr)"}>
              <Tabs.Trigger
                value={1}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
                p={4}
                w={{ base: "full", lg: "150px" }}
              >
                <Center w={"full"}>Active</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={2}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
                p={4}
                w={{ base: "full", lg: "150px" }}
              >
                <Center w={"full"}>Inactive</Center>
              </Tabs.Trigger>
              <Tabs.Trigger
                value={3}
                _selected={{
                  bg: "#707D8A",
                  color: "white",
                  borderRadius: "100px",
                }}
                p={4}
                w={{ base: "full", lg: "150px" }}
              >
                <Center w={"full"}>All Validators</Center>
              </Tabs.Trigger>
              <Tabs.Indicator bg="#707D8A" borderRadius="100px" />
            </Grid>
          </Tabs.List>
        </Tabs.Root>
        <Center w={"full"}>
          <SearchValidator callback={handleSearch} />
        </Center>
      </Flex>
      <Box bg="#FAFBFC" py={"5"} px={"8"} h={"100vh"} rounded={"2xl"}>
        {isMobile ? (
          <VStack
            bg={"white"}
            borderRadius="10px"
            px={"3"}
            separator={<StackSeparator />}
            maxH={'95vh'}
            overflow={'auto'}
          >
            {items.map((val, idx) => (
              <ValidatorItemMobile key={`validator-${idx}`} item={val} />
            ))}
          </VStack>
        ) : (
          <Table.ScrollArea maxH={"100vh"} h={"95vh"} rounded="lg">
            <Table.Root borderRadius="3xl" stickyHeader>
              <Table.Header>
                <Table.Row bg="#FAFBFC">
                  {columns.map((item, index) => (
                    <ColumnHeader
                      key={`column-${index}`}
                      column={item}
                      sortKey={state?.sortKey}
                      sortDirection={state?.sortDirection}
                      handleSort={handleSort}
                    />
                  ))}
                  {Array.from({ length: Math.max(0, 7 - columns.length) }).map(
                    (_, idx) => (
                      <Table.ColumnHeader key={`placeholder-${idx}`} />
                    )
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body
                style={{
                  borderRadius: "xl",
                }}
              >
                {state.loading ? (
                  <>
                    <SkeletonValidatorItems />
                  </>
                ) : (
                  items.map((val, idx) => (
                    <ValidatorItem
                      item={val}
                      key={`$validator-${idx}`}
                      idx={idx}
                    />
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}
      </Box>
    </Box>
  );
};

export default ValidatorList;
