import { Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { ACCOUNT_DETAILS } from "@/utils/go_to_page";
import { CopyButton } from "./copy_button";

/** Shortened address linking to its account (or `href`), with a copy button. */
export const AddressLink = ({
  address,
  href,
  beginning = 10,
  ending = 8,
}: {
  address: string;
  href?: string;
  beginning?: number;
  ending?: number;
}) => (
  <Flex as="span" display="inline-flex" align="center" gap="1">
    <ChakraLink asChild color="explorer.link">
      <NextLink href={href ?? ACCOUNT_DETAILS(address)}>{getMiddleEllipsis(address, { beginning, ending })}</NextLink>
    </ChakraLink>
    <CopyButton value={address} label="Copy address" />
  </Flex>
);
