import { Box, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useValidatorSearchQuery } from "@/graphql/types/general_types";
import { Panel } from "@/components/explorer/panel";
import { PageTitle } from "@/components/explorer/page_title";
import { SearchInput } from "@/components/explorer/search_input";
import { SearchHelp } from "@/components/explorer/search_help";
import { ValidatorName } from "@/components/explorer/validator_name";

export default function SearchPage() {
  const router = useRouter();
  const query = String(router.query.q ?? "").trim();
  const { data, loading } = useValidatorSearchQuery({
    variables: { query: `%${query}%`, limit: 20 },
    skip: !query,
  });
  const matches = (data?.matches ?? [])
    .map((match) => match.validator?.validatorInfo?.operatorAddress)
    .filter(Boolean) as string[];

  return (
    <>
      <NextSeo title="Search" openGraph={{ title: "Search" }} />
      <PageTitle title="Search" subtitle={query ? `Results for “${query}”` : "Type an identifier to begin."} />
      <Stack gap="5">
        <Box maxW="720px">
          <SearchInput />
        </Box>
        {query && (
          <Panel>
            <Text fontSize="md" fontWeight="600" color="explorer.text" mb="3">
              Validators
            </Text>
            {loading ? (
              <Text fontSize="sm" color="explorer.muted">
                Searching…
              </Text>
            ) : matches.length ? (
              matches.map((address, index) => (
                <Box key={address} py="3" borderTopWidth={index ? "1px" : "0"} borderColor="explorer.border">
                  <ValidatorName address={address} />
                </Box>
              ))
            ) : (
              <Text fontSize="sm" color="explorer.muted">
                Nothing on this chain matches “{query}”. Check the formats below.
              </Text>
            )}
          </Panel>
        )}
        <SearchHelp />
      </Stack>
    </>
  );
}
