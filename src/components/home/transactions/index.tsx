import {
  Flex,
  GridItem,
  Link as ChakraLink,
  Text,
  Table,
  For,
  VStack,
  Box,
  useBreakpointValue,
  StackSeparator
} from "@chakra-ui/react";
import { useTransactions } from "./hooks";
import Link from "next/link";
import numeral from "numeral";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import dayjs from "@/utils/dayjs";
import { Status } from "@/components/ui/status";
import Loading from "@/components/helper/loading";

const TxItemMobile = ({ item, rowIndex }) => {
    return (
      <VStack align="stretch" p={4} key={`transaction-${rowIndex}`}>
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Block</Text>
          <ChakraLink asChild colorPalette="blue">
            <Link href={`/blocks/${item.height}`}>
              {numeral(item.height).format("0,0")}
            </Link>
          </ChakraLink>
        </Flex>
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Hash</Text>
          <ChakraLink asChild colorPalette="blue">
            <Link href={`/transactions/${item.hash}`}>
              {getMiddleEllipsis(item.hash, { beginning: 12, ending: 6 })}
            </Link>
          </ChakraLink>
        </Flex>
        <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
          <Text>Messages</Text>
          <Text>{numeral(item.messages.count).format("0,0")}</Text>
        </Flex>
        <Flex justify="space-between">
          <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
            <Text>Result</Text>
            <Status value={item.success ? "success" : "error"}>
              <Text>{item.success ? "Success" : "Failed"}</Text>
            </Status>
          </Flex>
          <Flex direction={"column"} justify="space-between" gap={1} mb={2}>
            <Text>Time</Text>
            <Text>{dayjs.utc(item.timestamp).fromNow()}</Text>
          </Flex>
        </Flex>
      </VStack>
    );
  };

const Transactions = () => {
  const { state } = useTransactions();
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  if (!state?.items?.length)
    return (
      <GridItem borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" colSpan={2}>
        <Loading />
      </GridItem>
    );

  return (
    <GridItem borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" colSpan={2}>
      <Flex w="full" justifyContent={"space-between"} pb="4">
        <Text fontSize="24px" fontWeight={400}>
          Latest Transactions
        </Text>
        <ChakraLink asChild colorPalette={"blue"}>
          <Link href="/transactions">See more</Link>
        </ChakraLink>
      </Flex>
      {isMobile?     <Box bg="white" borderRadius="md" overflowY="auto" maxH="auto">
      <VStack px={3} separator={<StackSeparator />} align="stretch">
        {state.items.map((item, index) => (
          <TxItemMobile item={item} rowIndex={index} />
        ))}
      </VStack>
    </Box> :<Table.Root size={"sm"} bgColor="inherit" showColumnBorder={false}>
        <Table.Header>
          <Table.Row bgColor="inherit">
            <Table.ColumnHeader>Block</Table.ColumnHeader>
            <Table.ColumnHeader>Hash</Table.ColumnHeader>
            <Table.ColumnHeader>Result</Table.ColumnHeader>
            <Table.ColumnHeader>Time</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <For each={state.items}>
            {(item, index) => (
              <Table.Row key={`transaction-${index}`}>
                <Table.Cell height={"54px"}>
                  <ChakraLink asChild colorPalette="blue">
                    <Link href={`/blocks/${item.height}`}>
                      {numeral(item.height).format("0,0")}
                    </Link>
                  </ChakraLink>
                </Table.Cell>
                <Table.Cell>
                  <ChakraLink asChild colorPalette="blue">
                    <Link href={`/transactions/${item.hash}`}>
                      {getMiddleEllipsis(item.hash, {
                        beginning: 15,
                        ending: 5,
                      })}
                    </Link>
                  </ChakraLink>
                </Table.Cell>
                <Table.Cell>
                  <Status value={item.success ? "success" : "error"}>
                    <Text>{item.success ? "Success" : "Failed"}</Text>
                  </Status>
                </Table.Cell>
                <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
              </Table.Row>
            )}
          </For>
        </Table.Body>
      </Table.Root>}
    </GridItem>
  );
};

export default Transactions;
