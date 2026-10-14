import { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { CopyButton } from "./copy_button";

/** Collapsed JSON with a "label · N lines" summary, expandable in place. */
export const CodeBlock = ({ label, value }: { label: string; value: unknown }) => {
  const [open, setOpen] = useState(false);
  const json = JSON.stringify(value, null, 2) ?? "";
  const lines = json.split("\n").length;

  return (
    <Box bg="explorer.page" borderWidth="1px" borderColor="explorer.border" borderRadius="4px">
      <Flex justify="space-between" align="center" gap="3" px="3" py="2">
        <Text fontSize="xs" color="explorer.muted" truncate>
          {label} · {lines} lines
        </Text>
        <Flex align="center" gap="2" flexShrink={0}>
          <Button variant="plain" size="xs" h="auto" p="0" color="explorer.link" fontWeight="400" onClick={() => setOpen(!open)}>
            {open ? "Collapse" : "Expand"}
          </Button>
          <CopyButton value={json} label={`Copy ${label}`} />
        </Flex>
      </Flex>
      {open && (
        <Box
          as="pre"
          m="0"
          px="3"
          pb="3"
          maxH="480px"
          overflow="auto"
          fontSize="xs"
          lineHeight="1.6"
          color="explorer.text"
          fontFamily="mono"
          whiteSpace="pre"
        >
          {json}
        </Box>
      )}
    </Box>
  );
};
