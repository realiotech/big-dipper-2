import React from "react";
import {
  Box,
  Text,
  Flex,
  Grid
} from "@chakra-ui/react";
import useTranslation from "next-translate/useTranslation";
import { useVotesGraph } from "./hooks";
import numeral from "numeral";
import Big from "big.js";
import { formatGraphData } from "./utils";

export default function VotesGraph({ statusInfo }) {
  const { t } = useTranslation('proposals');

  const { state } = useVotesGraph();
  const { votes } = state;
  const { quorum } = state;

  const total = Big(votes.yes.value)
    .plus(votes.no.value)
    .plus(votes.veto.value)
    .plus(votes.abstain.value);

  const formattedData = formatGraphData({
    data: votes,
    total,
  });

  const bonded = Big(state.bonded?.value || 0);
  const totalVotedFormat = numeral(total.toFixed(2)).format('0,0.[00]');
  const totalBondedFormat = numeral(bonded.toNumber()).format('0,0.[00]');
  const totalVotedPercent =
    total.gt(0) && !bonded.eq(0)
      ? `${numeral(Big(total.toFixed(2)).div(bonded)?.times(100).toFixed(2)).format('0.[00]')}%`
      : '0%';

  const maxType = Object.keys(formattedData).reduce((max, key) => {
    return formattedData[key].percentage > formattedData[max].percentage ? key : max;
  }, "yes");

  return (
    <Box bg="#f9f9f9" py={6} px = {3} borderRadius="md" boxShadow="sm" >
      <Flex direction={{base: 'column', md:'row'}} align={{base: 'left', md:'center'}} mb={4} gap={10}>
        <Box >
          <Text fontSize="lg">
            Proposal Result
          </Text>
          <Text fontWeight="bold" fontSize="2xl" color={statusInfo?.tag}>
            {statusInfo.value}
          </Text>
        </Box>
        <Box display={{base: 'none', md:'block'}} w={"2px"} bgColor={"black"} h={50}></Box>
        <Box>
          <Text fontSize="lg" >
            Voted / Total ({totalVotedPercent})
          </Text>
          <Text fontWeight="bold" fontSize="2xl">
            {totalVotedFormat} / {totalBondedFormat}
          </Text>
        </Box>
      </Flex>
      <Grid templateColumns={{base: "repeat(1, 1fr)", md:"repeat(4, 1fr)"}} gap={4}>
        <Box
          p={'10px 16px'}
          bgColor={"white"}
          textAlign="center"
          borderRadius={"l3"}
          border={maxType === 'yes' ? '1px solid' : undefined}
          borderColor={maxType === 'yes' ? 'green.500' : undefined}
        >
          <Flex justify={'space-between'}>
            <Text fontWeight="bold" color="green.500">
              Yes 
            </Text>
            <Flex align={'flex-end'} flexDirection={'column'} >
              <Box fontWeight="bold" color="green.500" as='span' >{formattedData['yes'].percentage}</Box>
              <Text >{numeral(formattedData['yes'].display).format('0,0.[00]')}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box
          p={'10px 16px'}
          bgColor={"white"}
          textAlign="center"
          borderRadius={"l3"}
          border={maxType === 'no' ? '1px solid' : undefined}
          borderColor={maxType === 'no' ? 'red.500' : undefined}
        >
          <Flex justify={'space-between'}>
            <Text fontWeight="bold" color="red.500">
              No
            </Text>
            <Flex align={'flex-end'} flexDirection={'column'} >
              <Box fontWeight="bold" color="red.500" as='span' >{formattedData['no'].percentage}</Box>
              <Text >{numeral(formattedData['no'].display).format('0,0.[00]')}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box
          p={'10px 16px'}
          bgColor={"white"}
          textAlign="center"
          borderRadius={"l3"}
          border={maxType === 'veto' ? '1px solid' : undefined}
          borderColor={maxType === 'veto' ? 'orange.500' : undefined}
        >
          <Flex justify={'space-between'}>
            <Text fontWeight="bold" color="orange.500">
              No with veto
            </Text>
            <Flex align={'flex-end'} flexDirection={'column'} >
              <Box fontWeight="bold" color="orange.500" as='span' >{formattedData['veto'].percentage}</Box>
              <Text >{numeral(formattedData['veto'].display).format('0,0.[00]')}</Text>
            </Flex>
          </Flex>
        </Box>
        <Box
          p={'10px 16px'}
          bgColor={"white"}
          textAlign="center"
          borderRadius={"l3"}
          border={maxType === 'abstain' ? '1px solid' : undefined}
          borderColor={maxType === 'abstain' ? 'purple.500' : undefined}
        >
          <Flex justify={'space-between'}>
            <Text fontWeight="bold" color="purple.500">
              Abstain
            </Text>
            <Flex align={'flex-end'} flexDirection={'column'} >
              <Box fontWeight="bold" color="purple.500" as='span' >{formattedData['abstain'].percentage}</Box>
              <Text >{numeral(formattedData['abstain'].display).format('0,0.[00]')}</Text>
            </Flex>
          </Flex>
        </Box>
      </Grid>
    </Box>
  );
}
