import React from "react";
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
} from "@chakra-ui/react";
import { ProgressBar, ProgressRoot } from "@src/components/ui/progress";

const ValidatorTable = () => {
  const validators = Array(50).fill({
    validator: "Reallionaires Club | RST",
    votingPower: 542735,
    votingPowerPercentage: "58.7%",
    commission: "5%",
    status: "Active",
  });

  return (
    <Box p={6} bg="" minHeight="100vh">
      <Flex justify={"space-between"} mb={4}>
        <Tabs.Root colorScheme="blue">
          <Tabs.List>
            <Tabs.Trigger>Active</Tabs.Trigger>
            <Tabs.Trigger>Inactive</Tabs.Trigger>
            <Tabs.Trigger>All Validators</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
        <Input
          placeholder="Search Validator"
          maxW="300px"
          bg="white"
          borderRadius="md"
        />
      </Flex>

      <Table.Root bg="black" borderRadius="md" boxShadow="sm">
        <Table.Header>
          <Table.Row>
            <TableColumnHeader>Idx</TableColumnHeader>
            <TableColumnHeader>Validator</TableColumnHeader>
            <TableColumnHeader>Voting Power</TableColumnHeader>
            <TableColumnHeader textAlign={"center"}>
              Commission
            </TableColumnHeader>
            <TableColumnHeader textAlign={"center"}>Status</TableColumnHeader>
            <TableColumnHeader></TableColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body overflowY="auto">
          {validators.map((val, idx) => (
            <Table.Row key={idx}>
              <Table.Cell>#{idx + 1}</Table.Cell>
              <Table.Cell>
                <HStack>
                  <Box
                    boxSize="20px"
                    bg="gray.100"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    {/* Replace with actual image */}
                    <Box bg="gray.300" w="full" h="full" />
                  </Box>
                  <Text>{val.validator}</Text>
                </HStack>
              </Table.Cell>
              <Table.Cell w={"30%"}>
                <Box>
                  <Flex justify={"space-between"}>
                    <Text>{val.votingPower}</Text>
                    <Text>{val.votingPowerPercentage}</Text>
                  </Flex>
                  <ProgressRoot
                    shape={"full"}
                    h="50%"
                    size="sm"
                    w="100%"
                    variant={"subtle"}
                    value={58.7}
                  >
                    <ProgressBar />
                  </ProgressRoot>
                </Box>
              </Table.Cell>
              <Table.Cell textAlign={"center"}> {val.commission}</Table.Cell>
              <Table.Cell textAlign={"center"}>
                <Badge colorScheme="green" color="green"> ● {val.status}</Badge>
              </Table.Cell>
              <Table.Cell textAlign="right">
                <Button colorScheme="blue" size="sm">
                  Delegate
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default ValidatorTable;
