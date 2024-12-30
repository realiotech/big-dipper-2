import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import {
  useValidatorProfileDetails,
  useValidatorOverviewDetails,
  useValidatorVotingPowerDetails,
} from "./hooks";
import Overview from "./overview";
import VotingPower from "./voting_power";
import Blocks from "./blocks";
import Transactions from "./transactions";
import Staking from "./staking";

export default function ValidatorDetails() {
  const { state, loading } = useValidatorProfileDetails();
  const { exists, desmosProfile, operatorAddress } = state;
  const { state: validatorOverviewState, loading: validatorOverviewLoading } =
    useValidatorOverviewDetails();
  const { state: validatorVPState, loading: validatorVPLoading } =
    useValidatorVotingPowerDetails();

  return (
    <Box bg="white" w={'auto'} minH="100vh">
      <Flex gap={6} mb={8} flexWrap="wrap">
        <Overview state={validatorOverviewState} />
        <VotingPower
          data={validatorVPState.votingPower}
          status={validatorVPState.votingPower.validatorStatus}
        />
      </Flex>
      <Blocks address={operatorAddress} />
      <Staking address={operatorAddress} />
      <Transactions />
    </Box>
  );
}
