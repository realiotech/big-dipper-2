import { Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { ACCOUNT_DETAILS } from "@/utils/go_to_page";
import { Tag } from "./badges";
import { CopyButton } from "./copy_button";
import type { BlockscoutAddress } from "./blockscout";

export const CONTRACT_DETAILS = (address: string) => `/contracts/${address}`;

/** An EVM address from Blockscout: contracts link to the contract page, others to the account page. */
export const EvmAddress = ({ address, short = false }: { address?: BlockscoutAddress | null; short?: boolean }) => {
  if (!address?.hash) return <>—</>;
  const href = address.is_contract ? CONTRACT_DETAILS(address.hash) : ACCOUNT_DETAILS(address.hash);
  const label = address.name || (short ? getMiddleEllipsis(address.hash, { beginning: 6, ending: 4 }) : address.hash);

  return (
    <Flex as="span" display="inline-flex" align="center" gap="1.5" wrap="wrap">
      <ChakraLink asChild color="explorer.link" wordBreak="break-all">
        <NextLink href={href}>{label}</NextLink>
      </ChakraLink>
      <CopyButton value={address.hash} label="Copy address" />
      {address.is_contract && <Tag color="explorer.link">Contract</Tag>}
    </Flex>
  );
};
