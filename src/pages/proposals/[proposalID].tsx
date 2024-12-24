import React from "react";
import { useRouter } from "next/router";
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Button,
  Table,
  Grid,
} from "@chakra-ui/react";

export default function ProposalDetail() {
  const router = useRouter();
  const { proposalID } = router.query;

  // Example data for the proposal
  const proposal = {
    id: proposalID,
    title: "Add LMX as the third bonding token",
    status: "Passed",
    type: "proposals::MultistakingV1AddMultiStakingCoinProposal",
    proposer: "reallio1mn0p82nfdwae26hj3cv0x6w5cn9p2fhdnx2g5",
    submitTime: "Sep 24, 2024 12:02:55 PM (GMT+7)",
    depositEndTime: "Sep 27, 2024 10:22:50 PM (GMT+7)",
    votingStartTime: "Sep 25, 2024 06:51:25 PM (GMT+7)",
    votingEndTime: "Sep 28, 2024 06:51:25 PM (GMT+7)",
    description:
      "We propose incorporating the RWA (Liquid Mining Fund) into the Realio Network as our third staking token. This addition will diversify our staking options and expand the Realio Network's functionality.",
    result: {
      voted: "56,959,279.79",
      total: "66,253,957.04",
      passed: "90.06%",
      failed: "9.96%",
      veto: "0%",
      abstain: "0%",
    },
    votes: [
      { block: "Reallionaires Club | RIO", vote: "Yes" },
      { block: "Reallionaires Club | RIO", vote: "Yes" },
      { block: "Reallionaires Club | RIO", vote: "Yes" },
    ],
  };

  return (
    <Box p={6} bg="white" minHeight="100vh">
      {/* Proposal Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          #{proposal.id} {proposal.title}
        </Text>
        <Box
          px={3}
          py={1}
          bg={
            proposal.status === "Passed"
              ? "green.100"
              : proposal.status === "Invalid"
                ? "red.100"
                : "yellow.100"
          }
          color={
            proposal.status === "Passed"
              ? "green.500"
              : proposal.status === "Invalid"
                ? "red.500"
                : "yellow.500"
          }
          borderRadius="md"
        >
          {proposal.status}
        </Box>
      </Flex>

      {/* Proposal Details */}
      <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <VStack align="stretch">
          <HStack>
            <Text fontWeight="bold" w="150px">
              Type:
            </Text>
            <Text>{proposal.type}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold" w="150px">
              Proposer:
            </Text>
            <Text color="blue.500" cursor="pointer">
              {proposal.proposer}
            </Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold" w="150px">
              Submit Time:
            </Text>
            <Text>{proposal.submitTime}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold" w="150px">
              Deposit End Time:
            </Text>
            <Text>{proposal.depositEndTime}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold" w="150px">
              Voting Start Time:
            </Text>
            <Text>{proposal.votingStartTime}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold" w="150px">
              Voting End Time:
            </Text>
            <Text>{proposal.votingEndTime}</Text>
          </HStack>
          <Box>
            <Text fontWeight="bold" mb={2}>
              Description:
            </Text>
            <Text>{proposal.description}</Text>
          </Box>
        </VStack>
      </Box>

      {/* Proposal Result */}
      <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm" mb={8}>
        <Flex align="center" gap={10}>
          <Box>
            <Text fontSize="lg" fontWeight="bold">
              Proposal Result
            </Text>
            <Text fontWeight="bold" fontSize="2xl" color="green.500">
              PASSED
            </Text>
          </Box>
          <Box w={"2px"} bgColor={"black"} h={50}></Box>
          <Box>
            <Text fontSize="lg" fontWeight="bold">
              Voted / Tota (
              {(
                (parseFloat(proposal.result.voted) /
                  parseFloat(proposal.result.total)) *
                100
              ).toFixed(2)}
              %)
            </Text>
            <Text fontWeight="bold" fontSize="2xl">
              {proposal.result.voted} / {proposal.result.total}
            </Text>
          </Box>
        </Flex>
        <Grid templateColumns="repeat(4, 1fr)"  gap={4}>
          <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
            <Flex justify={'space-between'}>
              <Text fontWeight="bold" color="green.500">
                Yes
              </Text>
              <Text fontWeight="bold" color="green.500">{proposal.result.passed}</Text>
            </Flex>
          </Box>
          <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
            <Flex justify={'space-between'}>
              <Text fontWeight="bold" color="red.500">
                No
              </Text>
              <Text fontWeight="bold" color="red.500">{proposal.result.failed}</Text>
            </Flex>
          </Box>
          <Box p={'20px 5px'} bgColor={"white"} textAlign="center">
            <Flex justify={'space-between'}>
              <Text fontWeight="bold" color="yellow.500">
                Veto
              </Text>
              <Text fontWeight="bold" color="yellow.500" >{proposal.result.veto}</Text>
            </Flex>
          </Box>
          <Box  p={'20px 5px'} bgColor={"white"} textAlign="center">
            <Flex justify={'space-between'}>
              <Text fontWeight="bold" color="purple.500">
                Abstain
              </Text>
              <Text  fontWeight="bold" color="purple.500" >{proposal.result.abstain}</Text>
            </Flex>
          </Box>
        </Grid>
      </Box>

      {/* Votes Table */}
      <Box bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          Votes
        </Text>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Block</Table.ColumnHeader>
              <Table.ColumnHeader>Vote</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {proposal.votes.map((vote, index) => (
              <Table.Row key={index}>
                <Table.Cell>{vote.block}</Table.Cell>
                <Table.Cell color="green.500">{vote.vote}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
}
