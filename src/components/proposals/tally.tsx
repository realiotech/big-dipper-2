import { Box, Flex, SimpleGrid, Text } from "@chakra-ui/react";
import { formatPercent } from "@/components/explorer/format";
import type { Tally } from "./hooks";

export const VOTE_OPTIONS = [
  { key: "yes", label: "Yes", color: "explorer.success" },
  { key: "no", label: "No", color: "explorer.warning" },
  { key: "noWithVeto", label: "No with veto", color: "explorer.critical" },
  { key: "abstain", label: "Abstain", color: "explorer.muted" },
] as const;

/** Stacked result bar and the four option percentages. */
export const TallyBar = ({ tally }: { tally: Tally }) => {
  const share = (value: number) => (tally.total ? (value / tally.total) * 100 : 0);

  return (
    <Box>
      <Flex h="5px" borderRadius="full" overflow="hidden" bg="explorer.inset" mb="3">
        {VOTE_OPTIONS.map((option) => (
          <Box key={option.key} h="full" bg={option.color} w={`${share(tally[option.key])}%`} />
        ))}
      </Flex>
      <SimpleGrid columns={2} columnGap="6" rowGap="1.5">
        {VOTE_OPTIONS.map((option) => (
          <Flex key={option.key} justify="space-between" fontSize="xs" gap="2">
            <Flex align="center" gap="2" color="explorer.muted">
              <Box w="5px" h="5px" borderRadius="full" bg={option.color} />
              {option.label}
            </Flex>
            <Text color="explorer.text">{formatPercent(share(tally[option.key]))}</Text>
          </Flex>
        ))}
      </SimpleGrid>
    </Box>
  );
};
