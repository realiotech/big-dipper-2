import {
  Flex,
  GridItem,
  Link as ChakraLink,
  Text,
  Table,
  For,
  Box,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useBlocks } from "./hooks";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import numeral from "numeral";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import dayjs from "@/utils/dayjs";
import Proposer from "@/components/helper/proposer";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import NoData from "@/components/helper/nodata";
import Loading from "@/components/helper/loading";
import HelpLink from "@/components/helper/help_link";

const BlockItemMobile = ({ item, rowIndex }) => {
  const { name, address, imageUrl } = useProfileRecoil(item.proposer);

  return (
    <Box p="5" w="full">
      <VStack align="stretch">
        <Flex gap={1} direction="column">
          <Text>Height</Text>
          <HelpLink
            href={`/blocks/${item.height}`}
            value={numeral(item.height).format("0,0")}
          />
        </Flex>
        <Flex gap={1} direction="column">
          <Text>Proposer</Text>
          <Proposer address={address} image={imageUrl} name={name} />
        </Flex>
        <Flex gap={1} direction="column">
          <Text>Hash</Text>
          <Text>
            {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
          </Text>
        </Flex>
        <Flex justify="space-between">
          <Flex gap={1} direction="column">
            <Text>Txs</Text>
            <Text>{numeral(item.txs).format("0,0")}</Text>
          </Flex>
          <Flex gap={1} direction="column">
            <Text>Time</Text>
            <Text>{dayjs.utc(item.timestamp).fromNow()}</Text>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
};

const BlockItem = ({ item }) => {
  const { name, address, imageUrl } = useProfileRecoil(item.proposer);

  return (
    <Table.Row>
      <Table.Cell>
        <ChakraLink asChild colorPalette="blue">
          <Link href={`/blocks/${item.height}`}>
            {numeral(item.height).format("0,0")}
          </Link>
        </ChakraLink>
      </Table.Cell>
      <Table.Cell h={"54px"}>
        <Proposer address={address} image={imageUrl} name={name} />
      </Table.Cell>
      <Table.Cell>
        {getMiddleEllipsis(item.hash, { beginning: 6, ending: 5 })}
      </Table.Cell>
      <Table.Cell>{numeral(item.txs).format("0,0")}</Table.Cell>
      <Table.Cell>{dayjs.utc(item.timestamp).fromNow()}</Table.Cell>
    </Table.Row>
  );
};

const Blocks = () => {
  const { state } = useBlocks();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (state.loading)
    return (
      <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" colSpan={2}>
        <Loading />
      </GridItem>
    );

  return (
    <GridItem borderRadius="20px" bgColor={{ base: "#FAFBFC", _dark: "#0F0F0F" }} py="5" px="8" colSpan={2}>
      <Flex w="full" justifyContent={"space-between"} pb="4">
        <Text fontSize="24px" fontWeight={400}>
          Latest Blocks
        </Text>
        <ChakraLink asChild colorPalette={"blue"}>
          <Link href="/blocks">See more</Link>
        </ChakraLink>
      </Flex>
      {state.items.length ? (
        isMobile ? (
          <VStack
            divideY={"1px"}
            divideStyle={"ridge"}
            borderRadius="10px"
            bg={"white"}
            gap={0}
          >
            {state.items.map((item, index) => (
              <BlockItemMobile
                key={`block-${index}`}
                item={item}
                rowIndex={index}
              />
            ))}
          </VStack>
        ) : (
          <Table.Root  color={{ base: "black", _dark: "white" }}  bgColor="inherit" size="sm" showColumnBorder={false}>
            <Table.Header>
              <Table.Row bgColor="inherit">
                <Table.ColumnHeader>Height</Table.ColumnHeader>
                <Table.ColumnHeader>Proposer</Table.ColumnHeader>
                <Table.ColumnHeader>Hash</Table.ColumnHeader>
                <Table.ColumnHeader>Txs</Table.ColumnHeader>
                <Table.ColumnHeader>Time</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body bg={{ base: "white", _dark: "#262626" }}>
              <For each={state.items}>
                {(item, index) => (
                  <BlockItem key={`block-${index}`} item={item} />
                )}
              </For>
            </Table.Body>
          </Table.Root >
        )
      ) : (
        <NoData />
      )}
    </GridItem>
  );
};

export default Blocks;
