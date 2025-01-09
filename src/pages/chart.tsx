import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Bar, Line } from "react-chartjs-2";
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
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function Charts() {
  // Line Chart Data
  const priceData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"],
    datasets: [
      {
        label: "Price",
        data: [30, 40, 35, 45, 50, 42, 38],
        borderColor: "#6C63FF", // Line color
        backgroundColor: "rgba(108, 99, 255, 0.1)", // Shadow fill under the line
        borderWidth: 3,
        tension: 0.4, // Smooth curve
        pointBackgroundColor: "#6C63FF",
        pointBorderColor: "#6C63FF",
        pointRadius: 5, // Make points visible
        pointHoverRadius: 7,
        fill: true, // Fill area under the line
      },
    ],
  };

  // Price Chart Options
  const priceOptions = {
    plugins: {
      legend: { display: false }, // Hide the legend
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#A0AEC0" }, // X-axis labels color
      },
      y: {
        grid: { color: "#E2E8F0", lineWidth: 1, borderDash: [4, 4] }, // Dashed grid lines
        ticks: { color: "#A0AEC0" },
      },
    },
  };

  // Bar Chart Data
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
      legend: { display: false},
    },
    responsive: true,
  };

  return (
    <Flex gap={6} wrap="wrap" p={6}>
      {/* Price Chart */}
      <Box bg="#FAFBFC" p={6} borderRadius="md" boxShadow="sm" flex={1} minW="320px">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Price (24h)
        </Text>
        <Line data={priceData} options={priceOptions} height={200} />
      </Box>

      {/* Staking Chart */}
      <Box bg="#FAFBFC" p={6} borderRadius="md" boxShadow="sm" flex={1} minW="320px">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Staking
        </Text>
        <Bar data={stakingData} options={stakingOptions} height={200} />
      </Box>
    </Flex>
  );
}
