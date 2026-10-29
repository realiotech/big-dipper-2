import { Flex, Text } from "@chakra-ui/react";
import { Panel } from "./panel";

const EXAMPLES = [
  { label: "Block height", example: "19598329", hint: "Digits only" },
  { label: "Transaction hash", example: "3179206533E2EA46…73B8BFD7", hint: "64 hexadecimal characters" },
  { label: "EVM transaction", example: "0x1f2a…", hint: "0x followed by 64 hexadecimal characters" },
  { label: "Account", example: "realio1qphn44qdpf8rm…", hint: "Bech32 address with the realio1 prefix, or a 0x address" },
  { label: "Validator", example: "realiovaloper1q9xw5t…", hint: "Bech32 address with the realiovaloper1 prefix" },
  { label: "Validator name", example: "Realio Italy", hint: "Any part of a moniker" },
];

/** The identifier formats the search box understands. */
export const SearchHelp = ({ title = "What you can search for", compact = false }: { title?: string; compact?: boolean }) => (
  <Panel>
    {!compact && (
      <Text fontSize="md" fontWeight="600" color="explorer.text" mb="3">
        {title}
      </Text>
    )}
    {EXAMPLES.map((row, index) => (
      <Flex
        key={row.label}
        justify="space-between"
        align="center"
        gap="4"
        py="3"
        borderTopWidth={index ? "1px" : "0"}
        borderColor="explorer.border"
        fontSize="sm"
        wrap="wrap"
      >
        <Text color="explorer.text" minW="160px">
          {row.label}
        </Text>
        {!compact && (
          <Text color="explorer.link" flex="1" minW="0" truncate>
            {row.example}
          </Text>
        )}
        <Text color="explorer.muted" textAlign="end">
          {row.hint}
        </Text>
      </Flex>
    ))}
  </Panel>
);
