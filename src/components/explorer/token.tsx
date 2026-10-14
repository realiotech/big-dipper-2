import { Box, Flex, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { readAsset } from "@/recoil/asset";

// Same order as the staking chart: RIO, RST, DSTRX, LMX.
const TOKEN_COLORS: Record<string, string> = {
  RIO: "explorer.chart1",
  RST: "explorer.chart2",
  DSTRX: "explorer.chart3",
  LMX: "explorer.chart4",
};

/** Coloured dot and symbol for a denom, or "—" when the denom is unknown. */
export const TokenDot = ({ denom }: { denom?: string }) => {
  const asset = useRecoilValue(readAsset(denom ?? ""));
  if (!asset) return <Text color="explorer.muted">—</Text>;
  return (
    <Flex align="center" gap="2">
      <Box w="6px" h="6px" borderRadius="full" bg={TOKEN_COLORS[asset.symbol] ?? "explorer.muted"} />
      <Text color="explorer.muted">{asset.symbol}</Text>
    </Flex>
  );
};
