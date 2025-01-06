import React from "react";
import { Box, Center, Flex, GridItem, HStack, Text } from "@chakra-ui/react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS Components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function StakingChart() {
  const stakingData = {
    labels: ["RIO", "RST", "LMX"],
    datasets: [
      {
        label: "Staked",
        data: [1000000, 800000, 600000],
        backgroundColor: "#38A169",
        borderRadius: 4,
      },
      {
        label: "Unbonding",
        data: [50000, 40000, 30000],
        backgroundColor: "#6C63FF",
        borderRadius: 4,
      },
    ],
  };

  const stakingOptions = {
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "balck" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "balck" },
      },
    },
  };

  return (
    <GridItem borderRadius="20px" bgColor="#F6F7F8" py="5" px="8" colSpan={2}>
      <Flex h={"full"} direction={{ base: "column", md: "row" }}>
        <Box w={{ base: "full", md: "70%" }}>
          <Text fontSize="24px" fontWeight="bold" pb="6">
            Staking
          </Text>
          <Center>
            <Bar data={stakingData} options={stakingOptions} height={200} />
          </Center>
        </Box>
        <Box w={{ base: "full", md: "30%" }}>
          <Center h={"full"}>
            <Flex
              direction={{ base: "row", md: "column" }}
              gap={{ base: "30px", md: "30px" }}
            >
              <Box>
                <Text fontSize="md" fontWeight="bold" w={"full"}>
                  <Flex gap={2}>
                    <Center>
                      <Box borderRadius={4} height={5} w={5} bg={"#38A169"} />
                    </Center>
                    <Center>
                      <Text fontWeight="bold" w={"full"}>
                        Bonded
                      </Text>
                    </Center>
                  </Flex>
                </Text>
                <HStack>
                  <Text>Rio:</Text>
                  <Text>Value</Text>
                </HStack>
                <HStack>
                  <Text>Rst:</Text>
                  <Text>Value</Text>
                </HStack>
                <HStack>
                  <Text>Lmx:</Text>
                  <Text>Value</Text>
                </HStack>
              </Box>
              <Box>
                <Text fontSize="md" fontWeight="bold" w={"full"}>
                  <Flex gap={2}>
                    <Center>
                      <Box borderRadius={4} height={5} w={5} bg={"#6C63FF"} />
                    </Center>
                    <Center>
                      <Text fontSize="lg" fontWeight="bold" w={"full"}>
                        Unbonding
                      </Text>
                    </Center>
                  </Flex>
                </Text>
                <HStack>
                  <Text>Rio:</Text>
                  <Text>Value</Text>
                </HStack>
                <HStack>
                  <Text>Rst:</Text>
                  <Text>Value</Text>
                </HStack>
                <HStack>
                  <Text>Lmx:</Text>
                  <Text>Value</Text>
                </HStack>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Flex>
    </GridItem>
  );
}
