import { Box, Grid, Image, SimpleGrid, Text } from "@chakra-ui/react";
import numeral from "numeral";
import { StatCard } from "@/components/explorer/stat_card";
import { SearchInput } from "@/components/explorer/search_input";
import { useTokenSupplies } from "./hooks";

const PRICE_TOKENS = ["RIO", "RST", "DSTRX"];

const formatPrice = (price?: number) => (price ? `$${numeral(price).format("0,0.[000000]")}` : "—");

export default function Hero() {
  const { tokens, loading } = useTokenSupplies();

  return (
    <Grid templateColumns={{ base: "1fr", xl: "1fr 640px" }} gap={{ base: "6", xl: "10" }} alignItems="start">
      <Box pt={{ base: "0", xl: "2" }}>
        <Text as="h1" fontSize={{ base: "28px", md: "32px" }} fontWeight="600" letterSpacing="-0.02em" color="explorer.text">
          Realio Network Explorer
        </Text>
        <Text mt="2" mb="6" fontSize="sm" color="explorer.muted">
          Blocks, transactions, validators, governance and assets on an interoperable Layer-1 for real-world assets.
        </Text>
        <SearchInput />
      </Box>
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
        {PRICE_TOKENS.map((symbol) => {
          const token = tokens[symbol];
          return (
            <StatCard
              key={symbol}
              loading={loading}
              icon={token?.image && <Image src={token.image} alt={symbol} boxSize="16px" borderRadius="full" />}
              label={`${symbol} Price`}
              value={formatPrice(token?.price)}
              rows={[{ label: `${symbol} Total Supply`, value: numeral(token?.supply ?? 0).format("0,0") }]}
            />
          );
        })}
      </SimpleGrid>
    </Grid>
  );
}
