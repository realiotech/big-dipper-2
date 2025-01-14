import React from "react";
import { Box, GridItem, Text, Flex } from "@chakra-ui/react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import dayjs, { formatDayJs } from "@/utils/dayjs";
import { useHero, usePrice } from "./hooks";
import numeral from "numeral";
// import CustomToolTip from "../../helper/tooltip";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const PriceChart = () => {
  const { state } = useHero();
  const { tickPriceFormatter, formatTime } = usePrice();
  // Format the price history data
  const formatItems = state.tokenPriceHistory.map((item) => ({
    time: formatTime(dayjs.utc(item.time), "locale"),
    fullTime: formatDayJs(dayjs.utc(item.time), "locale"),
    value: item.value,
  }));
  const priceData = {
    labels: formatItems.map((item) => item.time), // X-axis labels
    datasets: [
      {
        label: "Price",
        data: formatItems.map((item) => item.value), // Price values
        borderColor: "rgba(57, 63, 70, 0.5)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );
          gradient.addColorStop(0, "rgba(57, 63, 70, 0.5)");
          gradient.addColorStop(1, "rgba(57, 63, 70, 0.1)");
          return gradient;
        },
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "rgba(57, 63, 70, 1)",
        pointBorderColor: "rgba(57, 63, 70, 0.5)",
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
      },
    ],
  };

  const priceOptions = {
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) =>
            `$${numeral(tooltipItem.raw).format("0,0.00")}`,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "balck" }, // X-axis label color
      },
      y: {
        grid: { color: "#E2E8F0", lineWidth: 1, borderDash: [4, 4] }, // Dashed grid lines
        ticks: {
          color: "black",
          callback: tickPriceFormatter, // Format Y-axis ticks
        },
      },
    },
  };

  return (
    <GridItem borderRadius="20px" bgColor="#FAFBFC" py="5" px="8" colSpan={2}>
      <Text fontSize="24px" fontWeight="bold" pb="6">
        Price (~24h)
      </Text>
      <Flex justify="center" align="center" h="300px">
        <Box w="100%" h="100%">
          <Line data={priceData} options={priceOptions} />
        </Box>
      </Flex>
    </GridItem>
  );
};

export default PriceChart;
