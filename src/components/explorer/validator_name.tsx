import { Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { VALIDATOR_DETAILS } from "@/utils/go_to_page";
import { InitialAvatar } from "./badges";

/** Initial avatar and moniker, linking to the validator page. */
export const ValidatorName = ({ address, color = "explorer.text" }: { address: string; color?: string }) => {
  const { name } = useProfileRecoil(address);
  const label = name && name !== address ? name : getMiddleEllipsis(address, { beginning: 14, ending: 8 });

  return (
    <Flex align="center" gap="2.5" minW="0">
      <InitialAvatar name={name && name !== address ? name : "?"} />
      <ChakraLink asChild color={color} fontSize="sm" truncate _hover={{ color: "explorer.link" }}>
        <NextLink href={VALIDATOR_DETAILS(address)}>{label}</NextLink>
      </ChakraLink>
    </Flex>
  );
};
