import React from "react";
import {
  Box,
  Text,
  Flex,
  Badge,
  Link,
  Stack,
  StackSeparator,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";
import { useProposals } from "./hooks";
import useTranslation from "next-translate/useTranslation";
import { getStatusInfo } from "./utils";

const ProposalItem = ({ proposal }) => {
  const { t } = useTranslation("proposals");
  const statusInfo = getStatusInfo(proposal.status, t);
  const isMobile = useBreakpointValue({ base: true, md: false });
  return isMobile ? (
    <Box bg="white" p={4}>
      <Flex justify="space-between" direction="column" align="center" gap={4} w={"full"}>
        <Flex justify="space-between" w="full">
          <Link
            w={'60%'}
            fontSize={'sm'}
            href={`/proposals/${proposal.id}`}
            fontWeight="bold"
            color="gray.700"
          >
            #{proposal.id} {proposal.title}
          </Link>
          <Badge
            colorPalette={statusInfo.tag}
            px={2}
            py={1}
            w={"80px"}
            height={"30px"}
            textAlign={"center"}
            justifyContent={"center"}
            fontSize={"sm"}
            borderRadius="md"
          >
            {statusInfo.value}
          </Badge>
        </Flex>
        <Text color="gray.500" fontSize="sm">
          {proposal.description}
        </Text>
      </Flex>
    </Box>
  ) : (
    <Box bg="white" p={4}>
      <Flex justify="space-between" align="center" mb={2} w={"full"}>
        <Flex direction={"column"} w="80%">
          <Link
            href={`/proposals/${proposal.id}`}
            fontWeight="bold"
            color="gray.700"
          >
            #{proposal.id} {proposal.title}
          </Link>
          <Text color="gray.500" fontSize="sm">
            {proposal.description}
          </Text>
        </Flex>
        <Badge
          colorPalette={statusInfo.tag}
          px={3}
          py={1}
          w={"140px"}
          height={"50px"}
          textAlign={"center"}
          justifyContent={"center"}
          fontSize={"md"}
          borderRadius="md"
        >
          {statusInfo.value}
        </Badge>
      </Flex>
    </Box>
  );
};

const SkeletonItem = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  return isMobile ? (
    <Box bg="white" p={4}>
      <Flex justify="space-between" direction="column" align="center" gap={4} w={"full"}>
        <Flex justify="space-between" w="full">
          <Skeleton h={"20px"} w="full" mb="4" />
        </Flex>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Flex>
    </Box>
  ) : (
    <Box bg="white" p={4}>
      <Flex justify="space-between" align="center" mb={2} w={"full"}>
        <Flex direction={"column"} w="80%">
          <Skeleton h={"20px"} w="full" mb="4" />
        </Flex>
        <Skeleton h={"20px"} w="full" mb="4" />
      </Flex>
    </Box>
  )
}

const ProposalList = () => {
  const { state } = useProposals();
  return (
    <Box
      bg="#FAFBFC"
      py={5}
      px={8}
      overflowY="hidden"
      overflowX="hidden"
      maxH="auto"
      minH={"85vh"}
      borderRadius="md"
    >
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        A total of {state?.items?.length} proposals found
      </Text>
      <Stack
        borderRadius="md"
        boxShadow="sm"
        border="1px solid"
        borderColor="gray.200"
        bg={"white"}
        gap={0}
        separator={<StackSeparator />}
        px={3}
      >
        {!state.loading ? state?.items?.length &&
          state?.items.map((proposal, index) => (
            <ProposalItem proposal={proposal} key={`proposal-${index}`} />
          )) : Array.from({ length: 10 }).map((_, index) => (
            <SkeletonItem key={`proposal-${index}`} />
          ))
        }
      </Stack>
    </Box>
  );
};

export default ProposalList;
