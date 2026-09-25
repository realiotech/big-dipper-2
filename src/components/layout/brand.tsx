import { Box, ClientOnly, Flex, IconButton, Image, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { LuMoon, LuSun } from "react-icons/lu";
import { useColorMode } from "../ui/color-mode";

export const Logo = () => (
  <ChakraLink asChild outline="none" _hover={{ textDecoration: "none" }} flexShrink={0}>
    <NextLink href="/">
      <Flex align="center" gap="2.5">
        {/* Both logos are rendered and CSS picks one, so SSR and the client agree. */}
        <Image src="/images/logo.svg" alt="" boxSize="24px" display={{ base: "block", _dark: "none" }} />
        <Image src="/images/logo_white.svg" alt="" boxSize="24px" display={{ base: "none", _dark: "block" }} />
        <Text fontSize="md" fontWeight="600" color="explorer.text" letterSpacing="-0.01em">
          Realio Explorer
        </Text>
      </Flex>
    </NextLink>
  </ChakraLink>
);

export const SoonTag = () => (
  <Text as="span" fontSize="10px" color="explorer.muted" borderWidth="1px" borderColor="explorer.border" borderRadius="4px" px="1.5">
    Soon
  </Text>
);

export const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <ClientOnly fallback={<Box boxSize="32px" />}>
      <IconButton
        aria-label="Toggle colour theme"
        onClick={toggleColorMode}
        variant="outline"
        size="xs"
        boxSize="32px"
        borderRadius="full"
        borderColor="explorer.border"
        color="explorer.text"
      >
        {colorMode === "dark" ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  );
};
