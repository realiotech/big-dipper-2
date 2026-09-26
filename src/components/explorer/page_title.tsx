import { Box, Flex, Link as ChakraLink, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import { ReactNode } from "react";

export type Crumb = { label: string; href?: string };

export const PageTitle = ({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) => (
  <Box mb="6">
    {crumbs && (
      <Flex as="nav" aria-label="Breadcrumb" gap="2" fontSize="sm" mb="3" color="explorer.muted">
        {crumbs.map((crumb, index) => (
          <Flex key={crumb.label} gap="2">
            {index > 0 && <Text as="span">/</Text>}
            {crumb.href ? (
              <ChakraLink asChild color="explorer.link">
                <NextLink href={crumb.href}>{crumb.label}</NextLink>
              </ChakraLink>
            ) : (
              <Text as="span" color="explorer.text">
                {crumb.label}
              </Text>
            )}
          </Flex>
        ))}
      </Flex>
    )}
    <Flex justify="space-between" align="center" gap="4">
      <Box minW="0">
        <Text as="h1" fontSize={{ base: "22px", md: "24px" }} fontWeight="600" letterSpacing="-0.02em" color="explorer.text">
          {title}
        </Text>
        {subtitle && (
          <Box mt="1" fontSize="sm" color="explorer.muted">
            {subtitle}
          </Box>
        )}
      </Box>
      {actions}
    </Flex>
  </Box>
);
