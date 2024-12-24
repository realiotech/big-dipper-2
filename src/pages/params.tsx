import React from "react";
import { Box, Text, Grid, VStack, Flex, GridItem } from "@chakra-ui/react";

const ParamsInfo = () => {
  return (
    <Box bg="white" p={6} minHeight="100vh">
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Staking
          </Text>
          <VStack align="stretch">
            <FlexRow label="Bond Denom" value="Stake" />
            <FlexRow label="Unbonding Time" value="7 day (s)" />
            <FlexRow label="Max Entries" value="7" />
            <FlexRow label="Historical Entries" value="10,000" />
            <FlexRow label="Max Validators" value="100" />
          </VStack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Slashing
          </Text>
          <VStack align="stretch">
            <FlexRow label="Downtime Jail Duration" value="1,800 second (s)" />
            <FlexRow label="Min Signed Per Window" value="50%" />
            <FlexRow label="Signed Block Window" value="10,000" />
            <FlexRow label="Slash Fraction Double Sign" value="5 / 100" />
            <FlexRow label="Slash Fraction Downtime" value="1 / 10,000" />
          </VStack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Minting
          </Text>
          <VStack align="stretch">
            <FlexRow label="Blocks Per Year" value="6,311,520" />
            <FlexRow label="Goal Bonded" value="0%" />
            <FlexRow label="Inflation Max" value="0%" />
            <FlexRow label="Inflation Min" value="0%" />
            <FlexRow label="Inflation Rate Change" value="0%" />
            <FlexRow label="Mint Denom" value="ario" />
          </VStack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Distribution
          </Text>
          <VStack align="stretch">
            <FlexRow label="Base Proposer Reward" value="1%" />
            <FlexRow label="Bonus Proposer Reward" value="4%" />
            <FlexRow label="Community Tax" value="2%" />
            <FlexRow label="Withdraw Address Enabled" value="True" />
          </VStack>
        </GridItem>
        <GridItem
          bg="#f9f9f9"
          p={6}
          borderRadius="md"
          boxShadow="sm"
          gap={0}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Gov
          </Text>
          <VStack align="stretch">
            <FlexRow label="Min Deposit" value="1000 RIO" />
            <FlexRow label="Max Deposit Period" value="3 day (s)" />
            <FlexRow label="Quorum" value="33%" />
            <FlexRow label="Threshold" value="50%" />
            <FlexRow label="Veto Threshold" value="33%" />
            <FlexRow label="Voting Period" value="3 day (s)" />
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
};

const FlexRow = ({ label, value }: { label: string; value: string }) => (
  <Flex p={2} borderTop={'1px solid #aba5a5'} justify="space-between" align="center">
    <Text fontWeight="semibold">{label}</Text>
    <Text>{value}</Text>
  </Flex>
);

export default ParamsInfo;
