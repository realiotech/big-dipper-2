import { Box, Grid, Skeleton, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

export type DetailRow = { label: string; value: ReactNode };

/** Label / value rows used by the detail pages' overview panels. */
export const DetailRows = ({ rows, loading = false }: { rows: DetailRow[]; loading?: boolean }) => (
  <Box>
    {rows.map((row, index) => (
      <Grid
        key={row.label}
        templateColumns={{ base: "1fr", md: "224px 1fr" }}
        gap={{ base: "1", md: "4" }}
        py="3"
        borderTopWidth={index ? "1px" : "0"}
        borderColor="explorer.border"
        fontSize="sm"
        alignItems="center"
      >
        <Text color="explorer.muted">{row.label}</Text>
        <Skeleton loading={loading} minH="20px">
          <Box color="explorer.text" minW="0" wordBreak="break-all">
            {row.value}
          </Box>
        </Skeleton>
      </Grid>
    ))}
  </Box>
);
