import React from "react";
import { Box, Text, Flex, VStack, Badge, Link } from "@chakra-ui/react";

const proposals = [
  {
    id: "1",
    title: "A total of 10 proposals found",
    description:
      "We propose incorporating the RWA (Liquid Mining Fund) into the Realio Network as our third staking token. This addition will diversify our staking options and expand the Realio Network's functionality...",
    status: "Passed",
  },
  {
    id: "2",
    title: "Realio v0.9.3 Upgrade: Set MinCommissionRate to 0.05",
    description:
      "This is the upgrade proposal of Realio Network with version v0.9.3, which set the minimum commission rate of all validators to 5%. The upgrade will take place at block height 7526754 which is around 1...",
    status: "Passed",
  },
  {
    id: "3",
    title: "Change Minimum Commission Rate to 5%",
    description:
      "As discussed in Realio Community in Discord, the minimum commission rate should be changed to 5% to prevent the centralization of delegations going to the validators with 0% or low commission rates...",
    status: "Passed",
  },
  {
    id: "4",
    title: "Realio Mainnet v0.9.0 upgrade: Multistaking",
    description:
      "This is the upgrade proposal of Realio Network with version v0.9.0, which enable multistaking feature. Follow the instructions at https://hackmd.io/@MasterR1-7l2f4/ryMYOkgyA, and the release page: http...",
    status: "Failed",
  },
  {
    id: "5",
    title: "IBC Update Client: Update expired client to Cosmoshub",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "6",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "7",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "8",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "9",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "10",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "11",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "12",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "13",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "14",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "15",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Passed",
  },
  {
    id: "16",
    title: "Decrease SlashFractionDowntime Params to 0.01%",
    description:
      "This proposal will update the expired client on channel-2 between the realionetwork_3301+1 networks and the cosmoshub-4 networks. In turn, this will allow users to transfer funds from Realio to Cosmos...",
    status: "Voting",
  },
];

const ProposalList = () => {
  return (
    <Box bg="#f9f9f9" p={6} overflowY={"auto"} maxH="100vh" borderRadius="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        A total of {proposals.length} proposals found
      </Text>
      <VStack align="stretch">
        {proposals.map((proposal, index) => (
          <Box
            key={index}
            bg="white"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Flex direction={"column"}>
                <Link href={`/proposals/${proposal.id}`} fontWeight="bold" color="gray.700">
                  #{proposal.id} {proposal.title}
                </Link>
                <Text w={"70%"} color="gray.500" fontSize="sm">
                  {proposal.description}
                </Text>
              </Flex>
              <Badge
                bgColor={
                  proposal.status === "Passed"
                    ? "green.100"
                    : proposal.status === "Failed"
                      ? "red.100"
                      : proposal.status === "Voting"
                        ? "yellow.100"
                        : "gray.100"
                }
                color={
                  proposal.status === "Passed"
                    ? "#2BA891"
                    : proposal.status === "Failed"
                      ? "#F14747"
                      : proposal.status === "Voting"
                        ? "yellow.800"
                        : "gray.100"
                }
                px={3}
                py={1}
                w={"140px"}
                height={"50px"}
                textAlign={"center"}
                justifyContent={"center"}
                fontSize={"md"}
                borderRadius="md"
              >
                {proposal.status}
              </Badge>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ProposalList;
