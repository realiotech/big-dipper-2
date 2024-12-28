import React, { useMemo } from "react";
import {
    Box,
    Text,
    Table,
    Button,
    Badge,
    Input,
    HStack,
    Tabs,
    TableColumnHeader,
    Flex,
    Link,
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
import NextLink from "next/link"
import SearchValidator from "./search";
import { fetchColumns } from "./utils";
import ColumnHeader from "./header";

const ValidatorItem = ({ item, idx }) => {
    const { t } = useTranslation("validators")
    const status = getValidatorStatus(item.status, item.jailed, item.tombstoned);
    const percentDisplay = item.status === 3 ? `${numeral(item.votingPowerPercent.toFixed(6)).format('0.[00]')}` : "0"
    const votingPower = numeral(item.votingPower).format('0,0');
    return (
        <Table.Row>
            <Table.Cell>#{idx + 1}</Table.Cell>
            <Table.Cell>
                <Proposer name={item.validator.name} address={item.validator.address} image={item.validator.imageUrl} />
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
            <Table.Cell textAlign={"right"}>{numeral(item.commission).format('0.[00]')}%</Table.Cell>
            <Table.Cell textAlign={"left"} pl={6}>
                <Status colorPalette={status.theme} color={status.theme}>{t(status.status)}</Status>
            </Table.Cell>
            <Table.Cell textAlign="right">
                <Link asChild>
                    <NextLink href={ADDRESS_DETAILS(item?.validator.address)}>
                        <Button colorPalette="purple" size="sm" disabled={item.status !== 3}>
                            Delegate
                        </Button>
                    </NextLink>
                </Link>
            </Table.Cell>
        </Table.Row>
    )
}

const ValidatorList = () => {
    const { t } = useTranslation('validators');
    const { state, handleTabChange, handleSearch, handleSort, sortItems } = useValidators();
    const validatorsMemo = useShallowMemo(state.items.map((x) => x.validator));
    const { profiles: dataProfiles, loading } = useProfilesRecoil(validatorsMemo);
    const items = useMemo(
        () => sortItems(state.items.map((x, i) => ({ ...x, validator: dataProfiles?.[i] }))),
        [state.items, dataProfiles, sortItems]
    );
    const columns = fetchColumns(t);

    return (
        <Box p={6} bg="" minHeight="100vh">
            <Flex justify={"space-between"} mb={4}>
                <Tabs.Root value={state?.tab + 1} variant="plain" onValueChange={(e) => handleTabChange(e, e.value - 1)}>
                    <Tabs.List bg="bg.muted" rounded="l3" p="1">
                        <Tabs.Trigger value={1}>
                            Active
                        </Tabs.Trigger>
                        <Tabs.Trigger value={2}>
                            Inactive
                        </Tabs.Trigger>
                        <Tabs.Trigger value={3}>
                            All Validators
                        </Tabs.Trigger>
                        <Tabs.Indicator rounded="l2" />
                    </Tabs.List>
                </Tabs.Root>
                <SearchValidator callback={handleSearch} />
            </Flex>
            <Table.Root bg="black" borderRadius="md" boxShadow="sm">
                <Table.Header>
                    <Table.Row>
                        {columns.map((item, index) =>
                            <ColumnHeader key={`column-${index}`} column={item} sortKey={state?.sortKey} sortDirection={state?.sortDirection} handleSort={handleSort} />
                        )
                        }
                        <TableColumnHeader />
                    </Table.Row>
                </Table.Header>
                <Table.Body overflowY="auto">
                    {!loading && items.map((val, idx) => (
                        <ValidatorItem item={val} key={`$validator-${idx}`} idx={idx} />
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
};

export default ValidatorList;
