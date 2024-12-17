import React from "react";
import { Box, Flex, Text, Table, Link, Code } from "@chakra-ui/react";

export default function TransactionDetails() {
  return (
    <Box p={6} minHeight="100vh">
      {/* Overview Section */}
      <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Overview
        </Text>
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Hash</Table.Cell>
              <Table.Cell textAlign="end">
                8F21BD0CBE9...
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Height</Table.Cell>
              <Table.Cell textAlign="end">
                <Link color="blue.500" href="#" >
                  9,665,201
                </Link>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Time</Table.Cell>
              <Table.Cell textAlign="end">Nov 12, 2024 11:05:28 AM (GMT+7)</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Fee</Table.Cell>
              <Table.Cell textAlign="end">0.000000001 RIO</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Gas (used / wanted)</Table.Cell>
              <Table.Cell textAlign="end">120,831 / 3,000,000</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Result</Table.Cell>
              <Table.Cell textAlign="end" color="green.500">
                ● Success
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Memo</Table.Cell>
              <Table.Cell textAlign="end">1a80cbd9bd9...</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Messages Section */}
      <Box bg="gray.50" p={6} borderRadius="md" boxShadow="sm" mb={8} border="1px solid #3182CE">
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            Messages
          </Text>
          <Box
            as="button"
            bg="green.100"
            color="green.700"
            px={4}
            py={1}
            borderRadius="md"
            fontWeight="medium"
          >
            Send
          </Box>
        </Flex>
        <Table.Root>
          <Table.Body>
            <Table.Row>
              <Table.Cell fontWeight="semibold">From Address:</Table.Cell>
              <Table.Cell textAlign="end" color="blue.500">
                <Link href="#" >
                  reallio147fluvqhgr65mj63r2wvts58qmmhrs79j4juw
                </Link>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">To Address:</Table.Cell>
              <Table.Cell textAlign="end" color="blue.500">
                <Link href="#" >
                  reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57
                </Link>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell fontWeight="semibold">Amount:</Table.Cell>
              <Table.Cell textAlign="end" fontWeight="bold">
                100 RIO
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Logs Section */}
      <Box bg="gray.50" p={6} mb={8} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Logs
        </Text>
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          overflowY="auto"
          fontSize={15}
          fontFamily="monospace"
          maxHeight={300}
          whiteSpace='pre-wrap'
        >

            {`[
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
[
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
  [
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
  [
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
  [
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
  [
  {
    "events": [
      {
        "type": "coin_received",
        "attributes": [
          {
            "key": "receiver",
            "value": "reallio15es4lw9hcvf4na3v2a2lnntdqhvqtae5p57"
          },
          {
            "key": "amount",
            "value": "1000000000000000000ario"
          }
        ]
      }
    ]
  }
]
`}
        </Box>
      </Box>
    </Box>
  );
}