import { useColorModeValue } from "@/components/ui/color-mode";

// Hex values of the explorer.chart* tokens: chart.js draws on a canvas and
// cannot read CSS variables.
const PALETTE = {
  light: { series: ["#5D5FEF", "#BF4A86", "#7879F1", "#2E855F"], tick: "#767F84", grid: "#EBEDED", card: "#FFFFFF" },
  dark: { series: ["#5D5FEF", "#EF5DA8", "#A5A6F6", "#8CA98E"], tick: "#7B878D", grid: "#162026", card: "#0C1317" },
};

export const useChartTheme = () => useColorModeValue(PALETTE.light, PALETTE.dark);
