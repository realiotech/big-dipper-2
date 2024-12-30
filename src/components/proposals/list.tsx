import React from "react";
import { Box, Text, Flex, Badge, Link, Stack, StackSeparator } from "@chakra-ui/react";
import { useProposals } from "./hooks";
import useTranslation from "next-translate/useTranslation";
import { getStatusInfo } from "./utils";

const ProposalItem = ({ proposal }) => {
    const { t } = useTranslation('proposals');
    const statusInfo = getStatusInfo(proposal.status, t);

    return (
        <Box
            bg="white"
            p={4}
            borderRadius="md"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
        >
            <Flex justify="space-between" align="center" mb={2} w={'full'} >
                <Flex direction={"column"} w='80%'>
                    <Link href={`/proposals/${proposal.id}`} fontWeight="bold" color="gray.700">
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
    )
}

const ProposalList = () => {
    const { state } = useProposals();
    console.log(state.items)
    return (
        <Box bg="#f9f9f9" py={5} px={8} overflowY='hidden' overflowX='hidden' maxH="auto" borderRadius="md">
            <Text fontSize="lg" fontWeight="bold" mb={4}>
                A total of {state?.items?.length} proposals found
            </Text>
            <Stack gap={4}>
                {state?.items?.length && state?.items.map((proposal, index) => (
                    <ProposalItem proposal={proposal} key={`proposal-${index}`}/>
                ))}
            </Stack>
        </Box>
    );
};

export default ProposalList;
