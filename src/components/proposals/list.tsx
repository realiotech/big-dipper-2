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
    <Box p={4} bg={{ base: "white", _dark: "#262626" }}>
      <Flex
        justify="space-between"
        direction="column"
        align="center"
        gap={4}
        w={"full"}
      >
        <Flex justify="space-between" w="full">
          <Link
            w={"60%"}
            fontSize={"sm"}
            href={`/proposals/${proposal.id}`}
            fontWeight="bold"
            color={{base: 'gray.700', _dark: 'white'}}
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
        <Text lineClamp="2" color="gray.500" fontSize="sm">
          {proposal.description}
        </Text>
      </Flex>
    </Box>
  ) : (
    <Box bg={{ base: "white", _dark: "#262626" }} p={4}>
      <Flex justify="space-between" align="center" mb={2} w={"full"}>
        <Flex direction={"column"} w="80%">
          <Link
            href={`/proposals/${proposal.id}`}
            fontWeight="bold"
            color={{base: 'gray.700', _dark: 'white'}}
          >
            #{proposal.id} {proposal.title}
          </Link>
          <Text color="gray.500" lineClamp="2" fontSize="sm">
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
    <Box bg={{ base: "white", _dark: "#262626" }} p={4}>
      <Flex
        justify="space-between"
        direction="column"
        align="center"
        gap={4}
        w={"full"}
      >
        <Flex justify="space-between" w="full">
          <Skeleton bg={'gray.400'} h={"20px"} w="full" mb="4" />
        </Flex>
        <Skeleton bg={'gray.400'} h={"20px"} w="full"/>
      </Flex>
    </Box>
  ) : (
    <Box bg={{ base: "white", _dark: "#262626" }} p={4}>
      <Flex justify="space-between" align="center"  w={"full"}>
        <Flex direction={"column"} w="70%">
          <Skeleton bg={'gray.400'} h={"20px"} w="full" mb="4" />
          <Skeleton bg={'gray.400'} h={"20px"} w="full"/>
        </Flex>
        <Skeleton bg={'gray.400'} h={"30px"} w="15%"/>
      </Flex>
    </Box>
  );
};

const ProposalList = () => {
  const { state } = useProposals();
  return (
    <Box
      bg={{ base: "#FAFBFC", _dark: "#0F0F0F" }}
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
        bg={{ base: "white", _dark: "#262626" }}
        gap={0}
        separator={<StackSeparator borderTopColor={{base: 'gray.200', _dark: 'gray.700'}}/>}
        px={3}
      >
        {!state.loading
          ? state?.items?.length &&
            state?.items.map((proposal, index) => (
              <ProposalItem proposal={proposal} key={`proposal-${index}`} />
            ))
          : Array.from({ length: 10 }).map((_, index) => (
              <SkeletonItem key={`proposal-${index}`} />
            ))}
      </Stack>
    </Box>
  );
};

export default ProposalList;
