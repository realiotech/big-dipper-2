import { Clipboard, IconButton } from "@chakra-ui/react";
import { LuCheck, LuCopy } from "react-icons/lu";

export const CopyButton = ({ value, label = "Copy" }: { value: string; label?: string }) => (
  <Clipboard.Root value={value} display="inline-flex">
    <Clipboard.Trigger asChild>
      <IconButton aria-label={label} variant="ghost" size="2xs" minW="auto" h="auto" p="0.5" color="explorer.muted">
        <Clipboard.Indicator copied={<LuCheck />}>
          <LuCopy />
        </Clipboard.Indicator>
      </IconButton>
    </Clipboard.Trigger>
  </Clipboard.Root>
);
