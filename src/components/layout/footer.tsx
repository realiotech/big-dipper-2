import { Box, Flex, Grid, Link as ChakraLink, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { EXTERNAL_LINKS, MONITOR_ITEM, NAV_GROUPS } from "./nav";
import { Logo } from "./brand";

const columns = [...NAV_GROUPS, { label: "Monitor", items: [MONITOR_ITEM] }];

export default function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="explorer.border" mt="auto">
      <Grid
        maxW="1440px"
        mx="auto"
        px={{ base: "4", md: "12" }}
        py="12"
        templateColumns={{ base: "1fr", lg: "1fr 810px" }}
        gap="10"
      >
        <Box maxW="340px">
          <Logo />
          <Text mt="4" fontSize="sm" color="explorer.muted">
            Block explorer for the Realio Network, an interoperable Layer-1 for digital and real-world assets.
          </Text>
        </Box>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap="8">
          {columns.map((column) => (
            <Stack key={column.label} gap="3">
              <Text fontSize="xs" letterSpacing="0.1em" textTransform="uppercase" color="explorer.muted">
                {column.label}
              </Text>
              {column.items.map((item) =>
                item.ready ? (
                  <ChakraLink key={item.href} asChild fontSize="sm" color="explorer.text" _hover={{ color: "explorer.link" }}>
                    <NextLink href={item.href}>{item.label}</NextLink>
                  </ChakraLink>
                ) : (
                  <Text key={item.href} fontSize="sm" color="explorer.muted" title="Coming soon">
                    {item.label}
                  </Text>
                )
              )}
            </Stack>
          ))}
        </SimpleGrid>
      </Grid>
      <Box borderTopWidth="1px" borderColor="explorer.border">
        <Flex
          maxW="1440px"
          mx="auto"
          px={{ base: "4", md: "12" }}
          py="5"
          justify="space-between"
          gap="4"
          direction={{ base: "column", sm: "row" }}
          fontSize="sm"
          color="explorer.muted"
        >
          <Text>Copyright © Realio Technology LTD</Text>
          <Flex gap="6">
            {EXTERNAL_LINKS.map((link) => (
              <ChakraLink key={link.href} href={link.href} target="_blank" rel="noreferrer" color="explorer.muted" _hover={{ color: "explorer.text" }}>
                {link.label}
              </ChakraLink>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
