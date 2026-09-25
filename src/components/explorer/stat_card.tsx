import { Box, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Panel } from "./panel";

export type StatRow = { label: string; value: ReactNode };

export const StatCard = ({
  label,
  icon,
  value,
  suffix,
  rows = [],
  loading = false,
}: {
  label: string;
  icon?: ReactNode;
  value: ReactNode;
  suffix?: string;
  rows?: StatRow[];
  loading?: boolean;
}) => (
  <Panel h="full">
    <Flex align="center" gap="2" color="explorer.muted" fontSize="sm">
      {icon}
      <Text>{label}</Text>
    </Flex>
    <Skeleton loading={loading} mt="2" minH="36px">
      <Flex align="baseline" gap="1.5">
        <Text fontSize="26px" lineHeight="36px" color="explorer.text" letterSpacing="-0.02em">
          {value}
        </Text>
        {suffix && (
          <Text fontSize="sm" color="explorer.muted">
            {suffix}
          </Text>
        )}
      </Flex>
    </Skeleton>
    {rows.length > 0 && (
      <Stack gap="0" mt="5">
        {rows.map((row, index) => (
          <Box
            key={row.label}
            py="3"
            borderTopWidth={index ? "1px" : "0"}
            borderColor="explorer.border"
          >
            <Text fontSize="sm" color="explorer.muted">
              {row.label}
            </Text>
            <Skeleton loading={loading} mt="1" minH="20px">
              <Text fontSize="sm" color="explorer.text">
                {row.value}
              </Text>
            </Skeleton>
          </Box>
        ))}
      </Stack>
    )}
  </Panel>
);
