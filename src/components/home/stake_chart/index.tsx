import React, { useEffect, useState } from "react";
import { Box, Center, Flex, For, GridItem, HStack, Text } from "@chakra-ui/react";
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
import type { ChartData } from "chart.js";
import { useRecoilValue } from "recoil";
import { readAssets } from "@/recoil/asset";
import { useHero } from "./hooks";
import { formatStakingData } from "./utils";
import numeral from "numeral";

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
  const { state } = useHero()
  const { assetArr } = useRecoilValue(readAssets)
  const [stakingData, setStakingData] = useState({
    labels: [],
    datasets: [
      {
        label: "Staked",
        data: [],
        backgroundColor: "#38A169",
        borderRadius: 4,
      },
      {
        label: "Unbonding",
        data: [],
        backgroundColor: "#6C63FF",
        borderRadius: 4,
      },
    ],
})

  useEffect(() => {
    if (!state.loading && assetArr.length > 0) {
      setStakingData(formatStakingData(state.bonded, state.unbonding, assetArr))
    }
  }, [assetArr, state.loading])


  const stakingOptions = {
    plugins: {
      legend: { display: false },
    },
    responsive: true,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "black" },
      },
      y: {
        grid: { display: false },
        ticks: { color: "black" },
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
                <For each={assetArr}>
                  {(item) => 
                    <HStack>
                      <Text>{item.symbol}:</Text>
                      <Text>{numeral(stakingData?.datasets[0].data[item.idx]).format("0,0")}</Text>
                    </HStack>
                  }
                </For>
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
                <For each={assetArr}>
                  {(item) =>
                    <HStack>
                      <Text>{item.symbol}:</Text>
                      <Text>{numeral(stakingData?.datasets[1].data[item.idx]).format("0,0")}</Text>
                    </HStack>
                  }
                </For>
              </Box>
            </Flex>
          </Center>
        </Box>
      </Flex>
    </GridItem>
  );
}
