import React from "react";
import {
  Box,
  Text,
  Flex,
  VStack,
  Stat,
  StatLabel,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  Link,
  HStack,
  TableRoot,
  StatValueText,
  Icon,
  Progress,
  Square
} from "@chakra-ui/react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { TfiReload } from "react-icons/tfi";
import { ProgressBar, ProgressRoot } from "@/components/ui/progress";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  // Donut Chart Data
  const chartData = {
    labels: ["RST", "RIO", "XLM", "USDC", "LMX"],
    datasets: [
      {
        data: [3.55, 1.55, 0.55, 0.25, 0.15], // Example values
        backgroundColor: [
          "#364FC7",
          "#4C6EF5",
          "#5C7CFA",
          "#63E6BE",
          "#94D82D",
        ],
        hoverBackgroundColor: [
          "#364FC7",
          "#4C6EF5",
          "#5C7CFA",
          "#63E6BE",
          "#94D82D",
        ],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "bottom", // Moves legend under the chart

      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false, // Allows custom height
  };

  return (
    <Box p={6} minH="100vh">
      <Flex gap={6} flexWrap="wrap" mb={8}>
        {/* Portfolio Balance */}
        <Flex flex={1} gap={6} flexDirection="column">
          <Box
            bg="#f9f9f9"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="1"
            minW="320px"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Portfolio Balance
            </Text>
            <Flex justify="space-between" gap={4}>
              <Stat.Root bg="white" padding={2}>
                <StatLabel>Total</StatLabel>
                <StatValueText color="blue.500">$4.24</StatValueText>
              </Stat.Root>
              <Stat.Root bg="white" padding={2}>
                <StatLabel>Available to Invest</StatLabel>
                <StatValueText color="blue.500">$4.24</StatValueText>
              </Stat.Root>
              <Stat.Root bg="white" padding={2}>
                <StatLabel>Current Investment Holdings</StatLabel>
                <StatValueText color="gray.600">$0.00</StatValueText>
              </Stat.Root>
            </Flex>
          </Box>
          <Box
            bg="#f9f9f9"
            p={6}
            borderRadius="md"
            boxShadow="sm"
            flex="2"
            minW="320px"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg" fontWeight="bold">
                Assets
              </Text>
              <Icon fontSize="2xl" color="black.700">
                <TfiReload />
              </Icon>
            </Flex>
            <VStack align="stretch">
              {["RST", "LMX", "RIO", "RIOS"].map((asset, i) => (
                <Flex
                  bg="white"
                  padding={2}
                  borderRadius={4}
                  key={i}
                  justify="space-between"
                  align="center"
                >
                  <HStack>
                    {/* Use Box for simple shapes */}
                    <Box
                      as="span"
                      display="inline-block"
                      w="40px"
                      h="40px"
                      bg="black"
                      borderRadius="50%"
                    />
                    <Box>
                      <Text fontWeight="medium">{asset}</Text>
                      <Text fontSize="sm" color="green.500">
                        0.0049327 ($0.00)
                      </Text>
                    </Box>
                  </HStack>
                  <Text fontWeight="bold" color="blue.500">
                    $0.70
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Flex>

        {/* Donut Chart */}
        <Box
          bg="#f9f9f9"
          p={6}
          borderRadius="md"
          boxShadow="sm"
          flex="1"
          minW="320px"
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Portfolio / USD
          </Text>
          <Flex align="center" gap={10} h="100%">
            <VStack align="stretch">
              <Flex justify="center" align="center" mb={4}>
                <Box w="350px" h="350px">
                  <Doughnut
                    data={chartData}
                    options={options}
                  />
                </Box>
              </Flex>
            </VStack>
            {/* Chart Legend */}
            <VStack w='100%' align="stretch">
              <HStack justify="space-between">
                <Text>RST</Text>
                <Text fontWeight="bold">$3.55</Text>
              </HStack>
              <ProgressRoot shape={"full"} size='lg' w="100%" value={58.7}>
                <ProgressBar />
              </ProgressRoot>
              <HStack justify="space-between">
                <Text>RIO</Text>
                <Text fontWeight="bold">$1.55</Text>
              </HStack>
              <ProgressRoot shape={"full"} size='lg' w="100%" value={30}>
                <ProgressBar />
              </ProgressRoot>
              <HStack justify="space-between">
                <Text>XLM</Text>
                <Text fontWeight="bold">$0.55</Text>
              </HStack>
              <ProgressRoot shape={"full"} size='lg' w="100%" value={30}>
                <ProgressBar />
              </ProgressRoot>
              <HStack justify="space-between">
                <Text>USDC</Text>
                <Text fontWeight="bold">$0.25</Text>
              </HStack>
              <ProgressRoot shape={"full"} size='lg' w="100%" value={30}>
                <ProgressBar />
              </ProgressRoot>
              <HStack justify="space-between">
                <Text>LMX</Text>
                <Text fontWeight="bold">$0.15</Text>
              </HStack>
              <ProgressRoot colorPalette="blue" variant="outline" bg shape={"full"} size='lg' w="100%" value={30}>
                <ProgressBar />
              </ProgressRoot>
            </VStack>
          </Flex>
        </Box>
      </Flex>

      {/* Transactions Section */}
      <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Transactions
        </Text>
        <TableRoot>
          <TableHeader>
            <TableRow bg="#f9f9f9">
              <TableColumnHeader>Hash</TableColumnHeader>
              <TableColumnHeader>Result</TableColumnHeader>
              <TableColumnHeader>Messages</TableColumnHeader>
              <TableColumnHeader>Amount</TableColumnHeader>
              <TableColumnHeader>Time</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Link color="blue.500" href="#">
                    AC5121...B732C
                  </Link>
                </TableCell>
                <TableCell>
                  <Flex color="green.500" align="center">
                    Success
                  </Flex>
                </TableCell>
                <TableCell>Send</TableCell>
                <TableCell>
                  <Text fontWeight="bold" color="black">
                    100 RIO
                  </Text>
                </TableCell>
                <TableCell>12s ago</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      </Box>
    </Box>
  );
}
