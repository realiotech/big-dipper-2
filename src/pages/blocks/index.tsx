import React from "react";
import { Box, Text, Flex, Table, Image } from "@chakra-ui/react";
import BlockLogo from "../assets/realio-logo-white.svg"; // Import your SVG logo

export default function Blocks() {
  const validators: string[] = Array(10).fill("Reallionaires Club | RST");

  return (
    <Box p={4} minHeight="100vh">
      {/* Section: Overview */}
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Overview
        </Text>
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell fontWeight="semibold" width="30%">
                Height
              </Table.Cell>
              <Table.Cell textAlign="end" >9,653,731</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Hash</Table.Cell>
              <Table.Cell textAlign="end">
                F0460715F6AE7DDFAC93FB05332E603F79CF323748EC92626472116CCFFC5E31
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Proposer</Table.Cell>
              <Table.Cell>
                <Flex  justify='end' gap={2}>
                  <Box boxSize="20px">
                    <Image src='/images/logo.svg' alt="" />
                  </Box>
                  <Text color="blue.500" fontWeight="medium" cursor="pointer">
                    Reallionaires Club | RST
                  </Text>
                </Flex>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Time</Table.Cell>
              <Table.Cell textAlign="end" >Nov 11, 2024 04:24:04 PM (GMT+7)</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Txs</Table.Cell>
              <Table.Cell textAlign="end">0</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Validators
        </Text>
        <Box bg='white' borderRadius='md' padding='3' overflowY="auto" maxH="150px">
          <Flex direction="column" gap={3}>
            {validators.map((item: string, index: number) => (
              <Flex key={index} align="center" gap={2}>
                <Box boxSize="20px">
                  <Image src='/images/logo.svg' alt="test" />
                </Box>
                <Text color="blue.500" fontWeight="medium" cursor="pointer">
                  {item}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Box>
      <Box bg="#F6F7F8" p={6} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Transactions
        </Text>
        <Flex justify="center" align="center" h="100px">
          <Box textAlign="center" color="gray.400">
            <Box alignItems='center'  boxSize="100px" >
            <Image src='/images/logo.svg' h={100}  width={100} alt="test" />
            </Box>
            <Text mt={2}>Nothing to show</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
