import { Box, Flex, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { SearchInput } from "./search_input";
import { SearchHelp } from "./search_help";

const LINKS = [
  { label: "Overview", href: "/" },
  { label: "Blocks", href: "/blocks" },
  { label: "Transactions", href: "/transactions" },
  { label: "Validators", href: "/validators" },
  { label: "Governance", href: "/proposals" },
];

/** "Nothing here" with search help; used by the 404 page and detail pages whose item does not exist. */
export const NotFound = () => (
  <Stack gap="6" maxW="640px" mx="auto" py={{ base: "4", md: "12" }}>
    <Box>
      <Text fontSize="sm" color="explorer.muted" letterSpacing="0.05em">
        404
      </Text>
      <Text as="h1" fontSize={{ base: "24px", md: "28px" }} fontWeight="600" letterSpacing="-0.02em" color="explorer.text">
        Nothing here
      </Text>
      <Text mt="2" fontSize="sm" color="explorer.muted">
        That block, transaction, account or validator is not on this chain, or it has not been indexed yet. Check the
        identifier format below and try again.
      </Text>
    </Box>
    <SearchInput />
    <SearchHelp compact />
    <Flex gap="2" wrap="wrap">
      {LINKS.map((link) => (
        <ChakraLink
          key={link.href}
          asChild
          fontSize="sm"
          color="explorer.link"
          px="3"
          py="1.5"
          borderWidth="1px"
          borderColor="explorer.border"
          borderRadius="4px"
          _hover={{ textDecoration: "none", bg: "explorer.inset" }}
        >
          <NextLink href={link.href}>{link.label}</NextLink>
        </ChakraLink>
      ))}
    </Flex>
  </Stack>
);
