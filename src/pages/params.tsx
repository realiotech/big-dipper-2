import React from "react";
import { Box, Text, Grid, Flex, GridItem, Stack, StackSeparator } from "@chakra-ui/react";
import { useParams } from "@/components/params/hooks";
import {
  formatDistribution,
  formatGov,
  formatMinting,
  formatSlashing,
  formatStaking,
} from '@/components/params/utils';
import useAppTranslation from '@/hooks/useAppTranslation';

const ParamsInfo = () => {
  const { t } = useAppTranslation('params');

  const { state } = useParams();
  const staking = state.staking
    ? {
      title: t('staking') ?? undefined,
      details: formatStaking(state.staking, t),
    }
    : null;

  const slashing = state.slashing
    ? {
      title: t('slashing') ?? undefined,
      details: formatSlashing(state.slashing, t),
    }
    : null;

  const minting = state.minting
    ? {
      title: t('minting') ?? undefined,
      details: formatMinting(state.minting, t),
    }
    : null;

  const distribution = state.distribution
    ? {
      title: t('distribution') ?? undefined,
      details: formatDistribution(state.distribution, t),
    }
    : null;

  const gov = state.gov
    ? {
      title: t('gov') ?? undefined,
      details: formatGov(state.gov, t),
    }
    : null;

  return (
    <Box bg="white" p={6} minHeight="100vh">
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {staking?.title}
          </Text>
          <Stack separator={<StackSeparator />}>
            {staking?.details.length && staking?.details.map((item, index) =>
              <FlexRow key={`staking-${index}`} label={item.label} value={item.detail} />
            )
            }
          </Stack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {slashing?.title}
          </Text>
          <Stack separator={<StackSeparator />}>
            {slashing?.details.length && slashing?.details.map((item, index) =>
              <FlexRow key={`slashing-${index}`} label={item.label} value={item.detail} />
            )
            }
          </Stack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {minting?.title}
          </Text>
          <Stack separator={<StackSeparator />}>
            {minting?.details.length && minting?.details.map((item, index) =>
              <FlexRow key={`minting-${index}`} label={item.label} value={item.detail} />
            )
            }
          </Stack>
        </GridItem>
        <GridItem bg="#f9f9f9" p={6} borderRadius="md" boxShadow="sm">
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {distribution?.title}
          </Text>
          <Stack separator={<StackSeparator />}>
            {distribution?.details.length && distribution?.details.map((item, index) =>
              <FlexRow key={`distribution-${index}`} label={item.label} value={item.detail} />
            )
            }
          </Stack>
        </GridItem>
        <GridItem
          bg="#f9f9f9"
          p={6}
          borderRadius="md"
          boxShadow="sm"
          gap={0}
        >
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            {gov?.title}
          </Text>
          <Stack separator={<StackSeparator />}>
            {gov?.details.length && gov?.details.map((item, index) =>
              <FlexRow key={`gov-${index}`} label={item.label} value={item.detail} />
            )
            }
          </Stack>
        </GridItem>
      </Grid>
    </Box>
  );
};

const FlexRow = ({ label, value }: { label: string; value: string }) => (
  <Flex py={2} justify="space-between" align="center">
    <Text>{label}</Text>
    <Text>{value}</Text>
  </Flex>
);

export default ParamsInfo;
