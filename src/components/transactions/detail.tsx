import React from "react";
import {
  Box,
  Text,
  Table,
  Link,
  Flex,
  Stack,
  StackSeparator,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useTransactionDetails } from "./hooks";
import numeral from "numeral";
import { BLOCK_DETAILS, formatNumber } from "@/utils";
import NextLink from "next/link";
import dayjs, { formatDayJs } from "@/utils/dayjs";
import { Status } from "../ui/status";
import Messages from "./messages";
import { getMiddleEllipsis } from "@/utils";

export default function TransactionDetails() {
  const {
    state,
    onMessageFilterCallback,
    toggleMessageDisplay,
    filterMessages,
  } = useTransactionDetails();
  const { overview, logs, messages } = state;
  const isMobile = useBreakpointValue({ base: true, md: false });
  return (
    <Box p={6} minHeight="100vh">
      {/* Overview Section */}
      <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Overview
        </Text>
        <Flex>
          <Stack w={"full"} separator={<StackSeparator />}>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Hash
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                {isMobile
                  ? getMiddleEllipsis(overview.hash, {
                      beginning: 11,
                      ending: 6,
                    })
                  : overview.hash}
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Height
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                <Link colorPalette={"blue"} asChild>
                  <NextLink href={BLOCK_DETAILS(overview.height)}>
                    {numeral(overview.height).format("0,0")}
                  </NextLink>
                </Link>
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Time
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                {formatDayJs(
                  dayjs.utc(overview.timestamp),
                  "locale",
                  "12-hour"
                )}
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Fee
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                {formatNumber(overview.fee.value, overview.fee.exponent)}{" "}
                {overview?.fee?.displayDenom?.toUpperCase()}
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Gas (used / wanted)
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                {numeral(overview.gasUsed).format("0,0.[00]")} /{" "}
                {numeral(overview.gasWanted).format("0,0.[00]")}
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Result
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                <Status value={overview.success ? "success" : "error"}>
                  {overview.success ? "Success" : "Failed"}
                </Status>
              </Text>
            </Flex>
            <Flex
              direction={{ base: "column", md: "row" }}
              justifyContent={"space-between"}
              bg="gray.50"
            >
              <Text px={"0"} fontWeight="semibold">
                Memo
              </Text>
              <Text textAlign={{ base: "left", md: "end" }}>
                {overview.memo}
              </Text>
            </Flex>
          </Stack>
        </Flex>
      </Box>
      <Messages messages={messages} />

      <Box bg="gray.50" p={6} mb={8} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Logs
        </Text>
        {logs && (
          <Box
            bg="white"
            p={4}
            borderRadius="md"
            overflowY="auto"
            fontSize={{base: 10, md: 15}}
            fontFamily="monospace"
            maxHeight={300}
            whiteSpace="pre-wrap"
          >
            <code>{JSON.stringify(logs, null, 4)}</code>
          </Box>
        )}
      </Box>
    </Box>
  );
}
