import { Flex, Link as ChakraLink } from "@chakra-ui/react";
import NextLink from "next/link";
import { useProfileRecoil } from "@/recoil/profiles/hooks";
import { getMiddleEllipsis } from "@/utils/get_middle_ellipsis";
import { VALIDATOR_DETAILS } from "@/utils/go_to_page";
import { ValidatorAvatar } from "./badges";

/** Avatar and moniker, linking to the validator page. */
export const ValidatorName = ({ address, color = "explorer.text" }: { address: string; color?: string }) => {
  const { name, imageUrl } = useProfileRecoil(address);
  const known = Boolean(name && name !== address);
  const label = known ? name : getMiddleEllipsis(address, { beginning: 14, ending: 8 });

  return (
    <Flex align="center" gap="2.5" minW="0">
      <ValidatorAvatar name={known ? name : "?"} src={imageUrl} />
      <ChakraLink asChild color={color} fontSize="sm" truncate _hover={{ color: "explorer.link" }}>
        <NextLink href={VALIDATOR_DETAILS(address)}>{label}</NextLink>
      </ChakraLink>
    </Flex>
  );
};
