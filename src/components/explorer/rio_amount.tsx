import { Text } from "@chakra-ui/react";
import { Tooltip } from "@/components/ui/tooltip";
import { formatUnits } from "./blockscout";
import { shortUnits } from "./format";

/**
 * An ario amount as RIO for tables: rounded to 6 places, with the exact
 * amount on hover whenever rounding changed it.
 */
export const RioAmount = ({ wei }: { wei: string }) => {
  const short = shortUnits(wei);
  const exact = formatUnits(wei);
  const body = (
    <>
      {short}{" "}
      <Text as="span" color="explorer.muted" fontSize="xs">
        RIO
      </Text>
    </>
  );
  if (short === exact) return body;
  return (
    <Tooltip content={`${exact} RIO`} openDelay={150} showArrow>
      <Text as="span" cursor="help">
        {body}
      </Text>
    </Tooltip>
  );
};
