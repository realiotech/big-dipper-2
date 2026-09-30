import { Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { TRANSACTION_DETAILS } from "@/utils/go_to_page";
import { TxLabel, txListHash } from "@/utils/tx_label";
import { CopyButton } from "./copy_button";

/**
 * A transaction list's hash cell. EVM transactions show and link their 0x
 * hash, which wallets and Blockscout use and their page is keyed by.
 */
export const TxHashLink = ({ hash, label, copy = true }: { hash: string; label?: TxLabel | null; copy?: boolean }) => {
  const shown = txListHash({ hash, label });
  return (
    <Flex as="span" display="inline-flex" align="center" gap="1">
      <ChakraLink asChild color="explorer.link">
        <NextLink href={TRANSACTION_DETAILS(shown)}>{getMiddleEllipsis(shown, { beginning: 10, ending: 6 })}</NextLink>
      </ChakraLink>
      {copy && <CopyButton value={shown} label="Copy transaction hash" />}
    </Flex>
  );
};
