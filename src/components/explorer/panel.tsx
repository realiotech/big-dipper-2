import { Box, BoxProps, Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { ReactNode } from "react";

export const Panel = (props: BoxProps) => (
  <Box
    bg="explorer.card"
    borderWidth="1px"
    borderColor="explorer.border"
    borderRadius="6px"
    p={{ base: "4", md: "5" }}
    {...props}
  />
);

export const PanelHeader = ({
  title,
  href,
  action = "View all",
  children,
}: {
  title: string;
  href?: string;
  action?: string;
  children?: ReactNode;
}) => (
  <Flex justify="space-between" align="center" mb="4" gap="3">
    <Text fontSize="md" fontWeight="600" color="explorer.text">
      {title}
    </Text>
    {children}
    {href && (
      <ChakraLink
        asChild
        fontSize="xs"
        color="explorer.muted"
        borderWidth="1px"
        borderColor="explorer.border"
        borderRadius="4px"
        px="2"
        py="1"
        _hover={{ color: "explorer.text", textDecoration: "none" }}
      >
        <NextLink href={href}>{action}</NextLink>
      </ChakraLink>
    )}
  </Flex>
);
