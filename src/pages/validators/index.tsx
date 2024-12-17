import React from "react";
import {
  Box,
  Flex,
  Text,
  Link,
  //   Divider,
  Tabs,
  TabsList,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  TableColumnHeader,
  Icon,
  VStack,
  HStack,
  Progress,
} from "@chakra-ui/react";
import {
  ProgressBar,
  ProgressRoot,
  ProgressLabel,
  ProgressValueText,
} from "@src/components/ui/progress";
// import { Progress } from "@chakra-ui/react";

export default function ValidatorDetails() {
  return (
    <Box p={6} bg="white" minH="100vh">
      {/* Top Section */}
      <Flex gap={6} mb={8} flexWrap="wrap">
        {/* Validator Information */}
        <Box
          bg="#F6F7F8"
          p={6}
          borderRadius="md"
          boxShadow="sm"
          flex="1"
          minW="320px"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Reallionaires Club | RST{" "}
              <Text as="span" color="green.500" ml={1}>
                ● Active
              </Text>
            </Text>
            <Box
              as="button"
              bg="blue.500"
              color="white"
              px={4}
              py={1}
              borderRadius="md"
              fontWeight="medium"
              _hover={{ bg: "blue.600" }}
            >
              Delegate
            </Box>
          </Flex>
          <Text color="gray.600" mb={4}>
            Professional blockchain validator and web3 developer team.
          </Text>
          <Flex justify="space-between" fontSize="sm" mb={4}>
            <VStack align="flex-start">
              <Text>Operator Address:</Text>
              <Text>Self Delegate Address:</Text>
              <Text>Web Site:</Text>
            </VStack>
            <VStack align="flex-end">
              <Link color="blue.500" href="#">
                reallio1q5...
              </Link>
              <Link color="blue.500" href="#">
                reallio9g5...
              </Link>
              <Link color="blue.500" href="#">
                decentrio.ventures
              </Link>
            </VStack>
          </Flex>
          <Flex justify="space-between" fontSize="sm">
            {/* <VStack align="flex-start">
              <Text>Commission</Text>
              <Text>Condition</Text>
              <Text>Max Commission Rate</Text>
            </VStack>
            <VStack align="flex-end" >
              <Text>5.00%</Text>
              <Text color="green.500">Good</Text>
              <Text>10.00%</Text>
            </VStack> */}
            <Box w={200} padding='10px' bg="white">
              <Flex direction="column">
                <Text>Commission</Text>
                <Text>5.00%</Text>
              </Flex>
            </Box>
            <Box w={200} padding='10px' bg="white">
              <Flex direction="column">
                <Text>Condition</Text>
                <Text color="green.500">Good</Text>
              </Flex>
            </Box>
            <Box w={200} padding='10px' bg="white">
              <Flex direction="column">
                <Text>Max Commission Rate</Text>
                <Text>10.00%</Text>
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Voting Power */}
        <Box
          bg="#F6F7F8"
          p={6}
          borderRadius="md"
          boxShadow="sm"
          flex="1"
          minW="320px"
        >
          <Text  fontSize="lg" fontWeight="bold" mb={4}>
            Voting Power
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            0.6%
            <Text as="span" fontSize="sm" color="gray.500" ml={2}>
              542,735 / 72,365,873
            </Text>
          </Text>
          {/* <Progress/> */}
          <Progress.Root shape="rounded" maxW="100%">
            <ProgressBar  />
          </Progress.Root>
          <VStack align="flex-start">
            <Flex justify="space-between" w="100%">
              <Text>Block</Text>
              <Link color="blue.500" href="#">
                9,665,075
              </Link>
            </Flex>
            <Flex justify="space-between" w="100%">
              <Text>Voting Power</Text>
              <Text>542,735</Text>
            </Flex>
            <Flex justify="space-between" w="100%">
              <Text>Voting Power %</Text>
              <Text>0.75%</Text>
            </Flex>
          </VStack>
        </Box>
      </Flex>

      {/* Last 100 Blocks */}
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Last 100 Blocks
        </Text>
        <Flex wrap="wrap" gap={1}>
          {Array.from({ length: 100 }).map((_, i) => (
            <Box
              key={i}
              w="20px"
              h="20px"
              bg="blue.500"
              borderRadius="sm"
            ></Box>
          ))}
        </Flex>
      </Box>

      {/* Tabs Section */}
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Tabs.Root>
          <TabsList>
            <Tabs.Trigger>Delegations</Tabs.Trigger>
            <Tabs.Trigger>Redelegations</Tabs.Trigger>
            <Tabs.Trigger>Unbondings</Tabs.Trigger>
          </TabsList>
          <Box textAlign="center" p={4} color="gray.500">
            <Text fontSize="sm" mt={4}>
              Nothing to show
            </Text>
          </Box>
        </Tabs.Root>
      </Box>

      {/* Transactions */}
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Transactions
        </Text>
        <Table.Root>
          <TableHeader bg="#F6F7F8">
            <TableRow bg="#F6F7F8">
              <TableColumnHeader>Block</TableColumnHeader>
              <TableColumnHeader>Hash</TableColumnHeader>
              <TableColumnHeader>Messages</TableColumnHeader>
              <TableColumnHeader>Result</TableColumnHeader>
              <TableColumnHeader>Time</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody borderRadius={100}>
            {Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Link color="blue.500" href="#">
                    8,069,833
                  </Link>
                </TableCell>
                <TableCell>
                  <Link color="blue.500" href="#">
                    BAD71F198A...
                  </Link>
                </TableCell>
                <TableCell>1</TableCell>
                <TableCell>
                  <Flex align="center" color="green.500">
                    Success
                  </Flex>
                </TableCell>
                <TableCell>12s ago</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table.Root>
      </Box>
    </Box>
  );
}
